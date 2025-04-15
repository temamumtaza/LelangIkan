import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [fishOptions, setFishOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFish, setLoadingFish] = useState(true);
  const [error, setError] = useState(null);
  
  const [auctionData, setAuctionData] = useState({
    fish: '',
    startingPrice: '',
    minBidIncrement: '10',
    duration: 3, // Default 3 days
    description: ''
  });
  
  // Fetch user's fish that are not currently in an auction
  useEffect(() => {
    const fetchUserFish = async () => {
      try {
        setLoadingFish(true);
        const response = await axios.get('/api/fish/available-for-auction');
        setFishOptions(response.data);
        setLoadingFish(false);
        
        // Set default fish if available
        if (response.data.length > 0) {
          setAuctionData(prev => ({
            ...prev,
            fish: response.data[0]._id
          }));
        }
      } catch (err) {
        setError('Failed to load your fish. Please try again.');
        setLoadingFish(false);
      }
    };
    
    fetchUserFish();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuctionData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an auction');
      return;
    }
    
    if (!auctionData.fish) {
      toast.error('Please select a fish for the auction');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auctions', {
        fish: auctionData.fish,
        startingPrice: parseFloat(auctionData.startingPrice),
        minBidIncrement: parseFloat(auctionData.minBidIncrement),
        duration: parseInt(auctionData.duration),
        description: auctionData.description
      });
      
      setLoading(false);
      toast.success('Auction created successfully!');
      navigate(`/auctions/${response.data._id}`);
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create auction');
      toast.error('Failed to create auction');
    }
  };
  
  // If user has no fish available for auction
  if (!loadingFish && fishOptions.length === 0) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body className="text-center">
            <h4>No Fish Available for Auction</h4>
            <p>You don't have any fish available to put up for auction.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/create-fish')}
              className="me-3"
            >
              Register a New Fish
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Create New Auction</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Fish</Form.Label>
                  {loadingFish ? (
                    <p>Loading your fish...</p>
                  ) : (
                    <Form.Select
                      name="fish"
                      value={auctionData.fish}
                      onChange={handleChange}
                      required
                    >
                      {fishOptions.map(fish => (
                        <option key={fish._id} value={fish._id}>
                          {fish.name} ({fish.species})
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Starting Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="startingPrice"
                        value={auctionData.startingPrice}
                        onChange={handleChange}
                        placeholder="Enter starting price"
                        min="1"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Bid Increment ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="minBidIncrement"
                        value={auctionData.minBidIncrement}
                        onChange={handleChange}
                        placeholder="Enter minimum bid increment"
                        min="1"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (days)</Form.Label>
                      <Form.Select
                        name="duration"
                        value={auctionData.duration}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="5">5 days</option>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={auctionData.description}
                    onChange={handleChange}
                    placeholder="Add details about this auction"
                    rows={3}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading || loadingFish}
                  >
                    {loading ? 'Creating...' : 'Create Auction'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateAuction; 