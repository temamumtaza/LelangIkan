import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FishCard from '../components/FishCard';
import AuctionCard from '../components/AuctionCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [myFish, setMyFish] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's fish
        const fishRes = await axios.get('/api/fish/my-fish');
        setMyFish(fishRes.data);
        
        // Fetch user's auctions (as seller)
        const auctionsRes = await axios.get('/api/auctions/my-auctions');
        setMyAuctions(auctionsRes.data);
        
        // Fetch auctions where user has active bids
        const activeBidsRes = await axios.get('/api/bids/active');
        setActiveBids(activeBidsRes.data);
        
        // Fetch auctions won by user
        const wonAuctionsRes = await axios.get('/api/auctions/won');
        setWonAuctions(wonAuctionsRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, navigate]);

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to view your dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h2>Welcome, {user.name}!</h2>
              <p className="text-muted">Manage your fish and auctions from your dashboard</p>
            </Col>
            <Col md={4} className="text-end d-flex justify-content-end align-items-center">
              <Button 
                variant="primary" 
                className="me-2"
                onClick={() => navigate('/create-fish')}
              >
                Register Fish
              </Button>
              <Button 
                variant="outline-primary"
                onClick={() => navigate('/create-auction')}
              >
                Start Auction
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tab.Container defaultActiveKey="my-fish">
        <Card>
          <Card.Header className="bg-light">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="my-fish">
                  My Fish
                  {myFish.length > 0 && <Badge bg="primary" className="ms-2">{myFish.length}</Badge>}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="my-auctions">
                  My Auctions
                  {myAuctions.length > 0 && <Badge bg="primary" className="ms-2">{myAuctions.length}</Badge>}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="active-bids">
                  Active Bids
                  {activeBids.length > 0 && <Badge bg="primary" className="ms-2">{activeBids.length}</Badge>}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="won-auctions">
                  Won Auctions
                  {wonAuctions.length > 0 && <Badge bg="primary" className="ms-2">{wonAuctions.length}</Badge>}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body>
            <Tab.Content>
              {/* My Fish Tab */}
              <Tab.Pane eventKey="my-fish">
                {loading ? (
                  <p className="text-center py-3">Loading your fish...</p>
                ) : myFish.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {myFish.map(fish => (
                      <Col key={fish._id}>
                        <FishCard fish={fish} showActions={true} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-4">
                    <p>You haven't registered any fish yet.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/create-fish')}
                    >
                      Register Your First Fish
                    </Button>
                  </div>
                )}
              </Tab.Pane>
              
              {/* My Auctions Tab */}
              <Tab.Pane eventKey="my-auctions">
                {loading ? (
                  <p className="text-center py-3">Loading your auctions...</p>
                ) : myAuctions.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {myAuctions.map(auction => (
                      <Col key={auction._id}>
                        <AuctionCard auction={auction} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-4">
                    <p>You haven't created any auctions yet.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/create-auction')}
                    >
                      Create Your First Auction
                    </Button>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Active Bids Tab */}
              <Tab.Pane eventKey="active-bids">
                {loading ? (
                  <p className="text-center py-3">Loading your active bids...</p>
                ) : activeBids.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {activeBids.map(bid => (
                      <Col key={bid.auction._id}>
                        <Card>
                          <Card.Body>
                            <h5>{bid.auction.fish.name}</h5>
                            <p className="mb-1">
                              <strong>Your bid:</strong> ${bid.amount.toFixed(2)}
                            </p>
                            <p className="mb-1">
                              <strong>Current highest:</strong> ${bid.auction.currentBid.toFixed(2)}
                            </p>
                            <p className="mb-1">
                              <strong>Status:</strong>{' '}
                              {bid.amount === bid.auction.currentBid ? (
                                <Badge bg="success">Highest Bidder</Badge>
                              ) : (
                                <Badge bg="danger">Outbid</Badge>
                              )}
                            </p>
                            <p className="mb-3">
                              <small>Ends: {new Date(bid.auction.endTime).toLocaleString()}</small>
                            </p>
                            <Link to={`/auctions/${bid.auction._id}`} className="btn btn-outline-primary btn-sm w-100">
                              View Auction
                            </Link>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-4">
                    <p>You don't have any active bids.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/auctions')}
                    >
                      Browse Auctions
                    </Button>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Won Auctions Tab */}
              <Tab.Pane eventKey="won-auctions">
                {loading ? (
                  <p className="text-center py-3">Loading your won auctions...</p>
                ) : wonAuctions.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {wonAuctions.map(auction => (
                      <Col key={auction._id}>
                        <Card>
                          <Card.Body>
                            <h5>{auction.fish.name}</h5>
                            <p className="mb-1">
                              <strong>Winning bid:</strong> ${auction.currentBid.toFixed(2)}
                            </p>
                            <p className="mb-1">
                              <strong>Seller:</strong> {auction.seller.name}
                            </p>
                            <p className="mb-3">
                              <small>Ended: {new Date(auction.endTime).toLocaleString()}</small>
                            </p>
                            <Link to={`/auctions/${auction._id}`} className="btn btn-outline-primary btn-sm w-100">
                              View Details
                            </Link>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-4">
                    <p>You haven't won any auctions yet.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/auctions')}
                    >
                      Browse Auctions
                    </Button>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </Container>
  );
};

export default Dashboard; 