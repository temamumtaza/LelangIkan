import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Carousel, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const FishDetails = () => {
  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchFish = async () => {
      try {
        const res = await axios.get(`/api/fish/${id}`);
        setFish(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch fish details');
        setLoading(false);
      }
    };

    fetchFish();
  }, [id]);

  const handleCreateAuction = () => {
    navigate(`/auctions/create?fishId=${id}`);
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!fish) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Fish Not Found</Alert.Heading>
          <p>The fish you're looking for could not be found.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-warning" onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={7}>
          {fish.images && fish.images.length > 0 ? (
            <Card className="mb-4">
              <Carousel>
                {fish.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={`/server/uploads/${image}`}
                      alt={`${fish.name} - Image ${index + 1}`}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          ) : (
            <Card className="mb-4">
              <Card.Img
                variant="top"
                src="https://via.placeholder.com/800x400?text=No+Image"
                style={{ height: '400px', objectFit: 'cover' }}
              />
            </Card>
          )}
        </Col>

        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{fish.name}</h4>
              {fish.isAuctioned && (
                <Badge bg="warning" className="ms-2">
                  In Auction
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Category:</Col>
                <Col sm={8}>{fish.category.charAt(0).toUpperCase() + fish.category.slice(1)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Condition:</Col>
                <Col sm={8}>{fish.condition.charAt(0).toUpperCase() + fish.condition.slice(1)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Weight:</Col>
                <Col sm={8}>{fish.weight} kg</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Location:</Col>
                <Col sm={8}>{fish.location}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Seller:</Col>
                <Col sm={8}>
                  {fish.seller?.name || 'Unknown'}
                  {fish.seller?.verified && (
                    <Badge bg="success" className="ms-1">
                      Verified
                    </Badge>
                  )}
                </Col>
              </Row>
              <Row className="mb-4">
                <Col sm={12}>
                  <h5 className="mb-2">Description</h5>
                  <p>{fish.description}</p>
                </Col>
              </Row>

              {isAuthenticated && !fish.isAuctioned && (
                user.role === 'seller' && fish.seller && fish.seller._id === user.id ? (
                  <Button 
                    variant="success" 
                    className="w-100 mb-2" 
                    onClick={handleCreateAuction}
                  >
                    Create Auction
                  </Button>
                ) : null
              )}

              <Button 
                variant="primary" 
                className="w-100" 
                as={Link} 
                to="/marketplace"
              >
                Back to Marketplace
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FishDetails; 