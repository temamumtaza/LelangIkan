import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to socket server
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
    setSocket(newSocket);

    // Join auction room
    newSocket.emit('joinAuction', id);

    // Listen for bid updates
    newSocket.on('bidUpdate', (updatedAuction) => {
      setAuction(updatedAuction);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.emit('leaveAuction', id);
        newSocket.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/auctions/${id}`);
        setAuction(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction details');
        setLoading(false);
        toast.error('Error loading auction details');
      }
    };

    fetchAuctionDetails();
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to place a bid');
      return;
    }

    try {
      const response = await axios.post(`/api/auctions/${id}/bid`, {
        amount: parseFloat(bidAmount)
      });
      toast.success('Bid placed successfully!');
      setBidAmount('');
      // Socket will update the auction data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error placing bid');
    }
  };

  if (loading) return <Container className="mt-5"><h3>Loading auction details...</h3></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!auction) return <Container className="mt-5"><Alert variant="warning">Auction not found</Alert></Container>;

  const isAuctionActive = new Date(auction.endTime) > new Date();
  const currentBid = auction.bids && auction.bids.length > 0 
    ? auction.bids[auction.bids.length - 1].amount 
    : auction.startingPrice;

  return (
    <Container className="mt-5">
      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Img 
              variant="top" 
              src={auction.fish?.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
              alt={auction.fish?.name || 'Auction fish'} 
              style={{ height: '400px', objectFit: 'cover' }} 
            />
            <Card.Body>
              <Card.Title as="h2">{auction.fish?.name || 'Unnamed Fish'}</Card.Title>
              <Card.Text>{auction.fish?.description || 'No description available'}</Card.Text>
              
              <ListGroup variant="flush" className="mb-4">
                <ListGroup.Item>
                  <strong>Species:</strong> {auction.fish?.species || 'Unknown'}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Size:</strong> {auction.fish?.size || 'Not specified'} cm
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Age:</strong> {auction.fish?.age || 'Unknown'} years
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Seller:</strong> {auction.seller?.username || 'Anonymous'}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card>
            <Card.Header as="h3">Auction Details</Card.Header>
            <Card.Body>
              <Alert variant={isAuctionActive ? "success" : "warning"}>
                Status: {isAuctionActive ? 'Active' : 'Ended'}
              </Alert>
              
              <ListGroup variant="flush" className="mb-4">
                <ListGroup.Item>
                  <strong>Current Bid:</strong> ${currentBid.toFixed(2)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Starting Price:</strong> ${auction.startingPrice.toFixed(2)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Bids:</strong> {auction.bids?.length || 0}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}
                </ListGroup.Item>
              </ListGroup>
              
              {isAuctionActive && (
                <Form onSubmit={handleBidSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Place Your Bid (min. ${(currentBid + 1).toFixed(2)})</Form.Label>
                    <Form.Control 
                      type="number" 
                      min={currentBid + 1} 
                      step="0.01" 
                      value={bidAmount} 
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100"
                    disabled={!user}
                  >
                    Place Bid
                  </Button>
                  {!user && (
                    <Alert variant="info" className="mt-3">
                      Please <Link to="/login">log in</Link> to place a bid
                    </Alert>
                  )}
                </Form>
              )}
              
              {!isAuctionActive && (
                <Alert variant="info">
                  This auction has ended
                  {auction.winner && (
                    <p className="mb-0 mt-2">
                      <strong>Winner:</strong> {auction.winner.username}
                    </p>
                  )}
                </Alert>
              )}
            </Card.Body>
          </Card>
          
          <Card className="mt-4">
            <Card.Header>Bid History</Card.Header>
            <ListGroup variant="flush">
              {auction.bids && auction.bids.length > 0 ? (
                [...auction.bids].reverse().map((bid, index) => (
                  <ListGroup.Item key={index}>
                    <div className="d-flex justify-content-between">
                      <span>{bid.bidder?.username || 'Anonymous'}</span>
                      <span>${bid.amount.toFixed(2)}</span>
                    </div>
                    <small className="text-muted">
                      {new Date(bid.timestamp).toLocaleString()}
                    </small>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No bids yet</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuctionDetails; 