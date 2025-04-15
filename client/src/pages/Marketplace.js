import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';

const Marketplace = () => {
  const [loading, setLoading] = useState(true);
  const [fish, setFish] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [currentTab, setCurrentTab] = useState('fish');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, [currentTab, page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (currentTab === 'fish') {
        let queryParams = `?page=${page}`;
        
        if (filters.category) {
          queryParams += `&category=${filters.category}`;
        }
        
        if (filters.condition) {
          queryParams += `&condition=${filters.condition}`;
        }

        response = await axios.get(`/api/fish${queryParams}`);
        setFish(response.data.data);
        setPagination(response.data.pagination);
      } else {
        let queryParams = `?page=${page}`;
        
        if (filters.status) {
          queryParams += `&status=${filters.status}`;
        }
        
        if (filters.minPrice) {
          queryParams += `&startingPrice[gte]=${filters.minPrice}`;
        }
        
        if (filters.maxPrice) {
          queryParams += `&startingPrice[lte]=${filters.maxPrice}`;
        }

        response = await axios.get(`/api/auctions${queryParams}`);
        setAuctions(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      status: ''
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(page - 1)}
        disabled={!pagination.prev}
      />
    );
    
    // Current page
    items.push(
      <Pagination.Item key={page} active>
        {page}
      </Pagination.Item>
    );
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(page + 1)}
        disabled={!pagination.next}
      />
    );

    return (
      <Pagination className="justify-content-center mt-4">
        {items}
      </Pagination>
    );
  };

  const renderFilters = () => {
    if (currentTab === 'fish') {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select 
              name="category" 
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="freshwater">Freshwater</option>
              <option value="saltwater">Saltwater</option>
              <option value="shellfish">Shellfish</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Condition</Form.Label>
            <Form.Select 
              name="condition" 
              value={filters.condition}
              onChange={handleFilterChange}
            >
              <option value="">All Conditions</option>
              <option value="fresh">Fresh</option>
              <option value="frozen">Frozen</option>
              <option value="processed">Processed</option>
            </Form.Select>
          </Form.Group>
        </>
      );
    } else {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Min Price</Form.Label>
            <Form.Control 
              type="number" 
              placeholder="Min Price"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Max Price</Form.Label>
            <Form.Control 
              type="number" 
              placeholder="Max Price"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </Form.Group>
        </>
      );
    }
  };

  const renderFishList = () => {
    if (fish.length === 0) {
      return (
        <div className="text-center my-5">
          <h4>No fish found</h4>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      );
    }

    return (
      <Row>
        {fish.map(item => (
          <Col key={item._id} lg={4} md={6} className="mb-4">
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={item.images && item.images.length > 0 
                  ? `/server/uploads/${item.images[0]}` 
                  : 'https://via.placeholder.com/300x200?text=No+Image'}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text className="mb-1">
                  <strong>Category:</strong> {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Card.Text>
                <Card.Text className="mb-1">
                  <strong>Condition:</strong> {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                </Card.Text>
                <Card.Text className="mb-1">
                  <strong>Weight:</strong> {item.weight} kg
                </Card.Text>
                <Card.Text className="mb-3">
                  <strong>Location:</strong> {item.location}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white">
                <Link to={`/fish/${item._id}`} className="btn btn-primary w-100">
                  View Details
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderAuctionList = () => {
    if (auctions.length === 0) {
      return (
        <div className="text-center my-5">
          <h4>No auctions found</h4>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      );
    }

    return (
      <Row>
        {auctions.map(auction => (
          <Col key={auction._id} lg={4} md={6} className="mb-4">
            <Card className="h-100">
              <Card.Img 
                variant="top"
                src={auction.fish && auction.fish.images && auction.fish.images.length > 0 
                  ? `/server/uploads/${auction.fish.images[0]}` 
                  : 'https://via.placeholder.com/300x200?text=No+Image'}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{auction.fish ? auction.fish.name : 'Unknown Fish'}</Card.Title>
                <Card.Text className="mb-1">
                  <strong>Current Price:</strong> Rp {auction.currentPrice.toLocaleString()}
                </Card.Text>
                <Card.Text className="mb-1">
                  <strong>Status:</strong> {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                </Card.Text>
                <Card.Text className="mb-3">
                  <strong>End Time:</strong> {new Date(auction.endTime).toLocaleString()}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white">
                <Link to={`/auctions/${auction._id}`} className="btn btn-primary w-100">
                  {auction.status === 'active' ? 'Bid Now' : 'View Auction'}
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Marketplace</h1>
        <div className="btn-group">
          <Button 
            variant={currentTab === 'fish' ? 'primary' : 'outline-primary'} 
            onClick={() => {
              setCurrentTab('fish');
              setPage(1);
            }}
          >
            Fish Products
          </Button>
          <Button 
            variant={currentTab === 'auctions' ? 'primary' : 'outline-primary'} 
            onClick={() => {
              setCurrentTab('auctions');
              setPage(1);
            }}
          >
            Auctions
          </Button>
        </div>
      </div>

      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Filters</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                {renderFilters()}
                <Button 
                  variant="secondary" 
                  className="w-100"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              {currentTab === 'fish' ? renderFishList() : renderAuctionList()}
              {renderPagination()}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Marketplace; 