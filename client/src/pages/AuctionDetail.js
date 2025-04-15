import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  
  // Get the minimum allowed bid amount
  const getMinBidAmount = () => {
    if (!auction) return 0;
    return auction.currentBid + auction.minBidIncrement;
  };
  
  // Format date display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!auction) return '';
    
    const endTime = new Date(auction.endTime);
    const now = new Date();
    
    if (now > endTime) {
      return 'Auction ended';
    }
    
    const diffMs = endTime - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} days, ${diffHrs} hours, ${diffMins} minutes`;
    } else if (diffHrs > 0) {
      return `${diffHrs} hours, ${diffMins} minutes`;
    } else {
      return `${diffMins} minutes`;
    }
  };
  
  // Check if user is the auction seller
  const isUserSeller = () => {
    if (!user || !auction) return false;
    return user.id === auction.seller._id;
  };
  
  // Check if user is the current highest bidder
  const isHighestBidder = () => {
    if (!user || !auction || !auction.highestBidder) return false;
    return user.id === auction.highestBidder._id;
  };
  
  // Fetch auction details and bids
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);
        
        // Get auction details
        const auctionRes = await axios.get(`/api/auctions/${id}`);
        setAuction(auctionRes.data);
        
        // Set initial bid amount
        const minBid = auctionRes.data.currentBid + auctionRes.data.minBidIncrement;
        setBidAmount(minBid.toFixed(2));
        
        // Get auction bids
        const bidsRes = await axios.get(`/api/auctions/${id}/bids`);
        setBids(bidsRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction details');
        setLoading(false);
      }
    };
    
    fetchAuctionDetails();
  }, [id]);
  
  // Place a bid
  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to place a bid');
      navigate('/login');
      return;
    }
    
    if (isUserSeller()) {
      toast.error('You cannot bid on your own auction');
      return;
    }
    
    const amount = parseFloat(bidAmount);
    const minAmount = getMinBidAmount();
    
    if (amount < minAmount) {
      toast.error(`Bid must be at least $${minAmount.toFixed(2)}`);
      return;
    }
    
    try {
      setPlacingBid(true);
      
      const response = await axios.post(`/api/auctions/${id}/bid`, { amount });
      
      // Update auction and bids
      setAuction(response.data.auction);
      setBids([response.data.bid, ...bids]);
      
      // Reset bid amount to new minimum
      const newMinBid = response.data.auction.currentBid + response.data.auction.minBidIncrement;
      setBidAmount(newMinBid.toFixed(2));
      
      toast.success('Bid placed successfully!');
      setPlacingBid(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
      setPlacingBid(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h3>Loading auction details...</h3>
        </div>
      </Container>
    );
  }
  
  if (error || !auction) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Auction not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/auctions')}>
          Back to Auctions
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{auction.fish.name}</h4>
              <Badge bg={auction.status === 'active' ? 'success' : 'secondary'}>
                {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
              </Badge>
            </Card.Header>
            
            <Card.Body>
              <Row>
                <Col md={6}>
                  <img 
                    src={auction.fish.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={auction.fish.name}
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                  />
                </Col>
                
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Species:</strong> {auction.fish.species}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Age:</strong> {auction.fish.age} years
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Size:</strong> {auction.fish.size} cm
                    </ListGroup.Item>
                    {auction.fish.color && (
                      <ListGroup.Item>
                        <strong>Color:</strong> {auction.fish.color}
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item>
                      <strong>Seller:</strong> {auction.seller.name}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Current Bid:</strong> ${auction.currentBid.toFixed(2)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Bid Increment:</strong> ${auction.minBidIncrement.toFixed(2)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>{auction.status === 'active' ? 'Ends' : 'Ended'}:</strong> {formatDate(auction.endTime)}
                    </ListGroup.Item>
                    {auction.status === 'active' && (
                      <ListGroup.Item className="text-success">
                        <strong>Time Remaining:</strong> {getTimeRemaining()}
                      </ListGroup.Item>
                    )}
                    {auction.status === 'completed' && auction.highestBidder && (
                      <ListGroup.Item>
                        <strong>Winner:</strong> {auction.highestBidder.name}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>
              </Row>
              
              {auction.fish.description && (
                <div className="mt-3">
                  <h5>Description</h5>
                  <p>{auction.fish.description}</p>
                </div>
              )}
              
              {auction.description && (
                <div className="mt-3">
                  <h5>Auction Details</h5>
                  <p>{auction.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Bidding history */}
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Bid History ({bids.length})</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {bids.length === 0 ? (
                <ListGroup.Item className="text-center py-3">
                  No bids yet. Be the first to bid!
                </ListGroup.Item>
              ) : (
                bids.map(bid => (
                  <ListGroup.Item key={bid._id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{bid.bidder.name}</strong> bid ${bid.amount.toFixed(2)}
                        {bid.bidder._id === user?.id && (
                          <Badge bg="info" className="ms-2">You</Badge>
                        )}
                      </div>
                      <small className="text-muted">{formatDate(bid.createdAt)}</small>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Bidding form */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Place Bid</h5>
            </Card.Header>
            <Card.Body>
              {!user ? (
                <div className="text-center py-3">
                  <p>You need to be logged in to place a bid.</p>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/login')}
                  >
                    Log In to Bid
                  </Button>
                </div>
              ) : auction.status !== 'active' ? (
                <Alert variant="secondary">
                  This auction has {auction.status === 'completed' ? 'ended' : 'been ' + auction.status}.
                </Alert>
              ) : isUserSeller() ? (
                <Alert variant="info">
                  You cannot bid on your own auction.
                </Alert>
              ) : (
                <Form onSubmit={handleBid}>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Bid Amount ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min={getMinBidAmount()}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      Minimum bid: ${getMinBidAmount().toFixed(2)}
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={placingBid || isHighestBidder()}
                    >
                      {placingBid ? 'Processing...' : isHighestBidder() ? 'You have the highest bid' : 'Place Bid'}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
          
          {/* Auction status info */}
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Auction Status</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Status:</strong>{' '}
                  <Badge bg={auction.status === 'active' ? 'success' : 'secondary'}>
                    {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Bids:</strong> {bids.length}
                </ListGroup.Item>
                {auction.highestBidder && (
                  <ListGroup.Item>
                    <strong>Highest Bidder:</strong> {auction.highestBidder.name}
                    {auction.highestBidder._id === user?.id && (
                      <Badge bg="success" className="ms-2">You</Badge>
                    )}
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <strong>Started:</strong> {formatDate(auction.createdAt)}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuctionDetail; 