import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const FishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [fish, setFish] = useState(null);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const fetchFishDetails = async () => {
      try {
        setLoading(true);
        
        // Get fish details
        const fishRes = await axios.get(`/api/fish/${id}`);
        setFish(fishRes.data);
        
        // Check if fish is in an active auction
        try {
          const auctionRes = await axios.get(`/api/auctions/by-fish/${id}`);
          if (auctionRes.data) {
            setAuction(auctionRes.data);
          }
        } catch (err) {
          // No auction found is okay, not an error
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load fish details');
        setLoading(false);
      }
    };
    
    fetchFishDetails();
  }, [id]);
  
  // Check if the current user is the owner of this fish
  const isOwner = () => {
    if (!user || !fish) return false;
    return user.id === fish.owner._id;
  };
  
  // Handle fish deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this fish? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      await axios.delete(`/api/fish/${id}`);
      toast.success('Fish deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete fish');
      setDeleting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h3>Loading fish details...</h3>
        </div>
      </Container>
    );
  }
  
  if (error || !fish) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Fish not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
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
              <h4 className="mb-0">{fish.name}</h4>
              {auction && (
                <Badge bg="warning" text="dark">In Auction</Badge>
              )}
            </Card.Header>
            
            <Card.Body>
              <Row>
                <Col md={6} className="mb-4">
                  <img 
                    src={fish.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={fish.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                  />
                </Col>
                
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Species:</strong> {fish.species}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Age:</strong> {fish.age} years
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Size:</strong> {fish.size} cm
                    </ListGroup.Item>
                    {fish.color && (
                      <ListGroup.Item>
                        <strong>Color:</strong> {fish.color}
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item>
                      <strong>Owner:</strong> {fish.owner.name}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Registered:</strong> {formatDate(fish.createdAt)}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
              
              {fish.description && (
                <div className="mt-3">
                  <h5>Description</h5>
                  <p>{fish.description}</p>
                </div>
              )}
              
              {isOwner() && !auction && (
                <div className="mt-4 d-flex justify-content-between">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/create-auction?fish=${fish._id}`)}
                  >
                    Start Auction
                  </Button>
                  
                  <div>
                    <Button
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => navigate(`/edit-fish/${fish._id}`)}
                    >
                      Edit Fish
                    </Button>
                    
                    <Button
                      variant="outline-danger"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete Fish'}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Owner info card */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Owner Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div>
                  <h5 className="mb-1">{fish.owner.name}</h5>
                  <p className="text-muted mb-0">Member since {formatDate(fish.owner.createdAt)}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Total Fish:</strong> {fish.owner.fishCount || 'N/A'}
              </div>
              
              <div className="mb-3">
                <strong>Completed Auctions:</strong> {fish.owner.auctionCount || 'N/A'}
              </div>
              
              {user && user.id !== fish.owner._id && (
                <Button
                  variant="outline-primary"
                  className="w-100"
                  as={Link}
                  to={`/profile/${fish.owner._id}`}
                >
                  View Profile
                </Button>
              )}
            </Card.Body>
          </Card>
          
          {/* Active auction card */}
          {auction && (
            <Card>
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">Active Auction</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="mb-3">
                  <ListGroup.Item>
                    <strong>Current Bid:</strong> ${auction.currentBid.toFixed(2)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Bid Increment:</strong> ${auction.minBidIncrement.toFixed(2)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Total Bids:</strong> {auction.bidCount}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}
                  </ListGroup.Item>
                </ListGroup>
                
                <div className="d-grid">
                  <Button
                    variant="primary"
                    as={Link}
                    to={`/auctions/${auction._id}`}
                  >
                    View Auction
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FishDetail; 