import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';

const AuctionList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'active',
    species: searchParams.get('species') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'ending-soon'
  });
  
  // List of fish species for the filter
  const [speciesList, setSpeciesList] = useState([]);
  
  // Create sorted and filtered auction list
  const filteredAuctions = () => {
    let result = [...auctions];
    
    // Filter by search term (fish name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(auction => 
        auction.fish.name.toLowerCase().includes(term) || 
        auction.fish.species.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (filters.status) {
      result = result.filter(auction => auction.status === filters.status);
    }
    
    // Filter by species
    if (filters.species) {
      result = result.filter(auction => auction.fish.species === filters.species);
    }
    
    // Filter by price range
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      result = result.filter(auction => auction.currentBid >= min);
    }
    
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter(auction => auction.currentBid <= max);
    }
    
    // Sort auctions
    switch (filters.sort) {
      case 'ending-soon':
        result.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        break;
      case 'price-low':
        result.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'price-high':
        result.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'most-bids':
        result.sort((a, b) => b.bidCount - a.bidCount);
        break;
      default:
        result.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    }
    
    return result;
  };
  
  // Update URL with filters
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (filters.status) params.set('status', filters.status);
    if (filters.species) params.set('species', filters.species);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort) params.set('sort', filters.sort);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    updateUrlParams();
  };
  
  // Apply filters
  const applyFilters = () => {
    updateUrlParams();
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'active',
      species: '',
      minPrice: '',
      maxPrice: '',
      sort: 'ending-soon'
    });
    
    navigate('/auctions');
  };
  
  // Fetch auctions and species list
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auctions');
        setAuctions(response.data);
        
        // Extract unique species for filter
        const species = [...new Set(response.data.map(auction => auction.fish.species))];
        setSpeciesList(species.sort());
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load auctions');
        setLoading(false);
      }
    };
    
    fetchAuctions();
  }, []);
  
  // Update URL when filters change
  useEffect(() => {
    if (!loading) {
      updateUrlParams();
    }
  }, [filters]);
  
  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="mb-0">Fish Auctions</h2>
              <p className="text-muted">Discover and bid on unique fish</p>
            </Col>
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by fish name or species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Row>
        {/* Filters sidebar */}
        <Col lg={3} className="mb-4">
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Filters</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="active">Active Only</option>
                    <option value="completed">Completed</option>
                    <option value="all">All Statuses</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Species</Form.Label>
                  <Form.Select
                    name="species"
                    value={filters.species}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Species</option>
                    {speciesList.map(species => (
                      <option key={species} value={species}>{species}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Min $"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Max $"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Col>
                  </Row>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Sort By</Form.Label>
                  <Form.Select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                  >
                    <option value="ending-soon">Ending Soon</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="most-bids">Most Bids</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Auctions grid */}
        <Col lg={9}>
          {loading ? (
            <div className="text-center py-5">
              <h4>Loading auctions...</h4>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : filteredAuctions().length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <h4>No auctions found</h4>
                <p>Try adjusting your search or filters to find auctions.</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <p className="mb-0">{filteredAuctions().length} auctions found</p>
              </div>
              
              <Row xs={1} md={2} lg={3} className="g-4">
                {filteredAuctions().map(auction => (
                  <Col key={auction._id}>
                    <AuctionCard auction={auction} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AuctionList; 