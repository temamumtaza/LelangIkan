import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const AuctionCard = ({ auction }) => {
  // Determine auction status color
  const getStatusBadge = () => {
    switch(auction.status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'ended':
        return <Badge bg="secondary">Ended</Badge>;
      case 'completed':
        return <Badge bg="primary">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="info">{auction.status}</Badge>;
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
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
      return `${diffDays}d ${diffHrs}h remaining`;
    } else if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins}m remaining`;
    }
  };

  // Get proper image URL
  const imageUrl = auction.fish.image 
    ? auction.fish.image 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img 
        variant="top" 
        src={imageUrl} 
        alt={auction.fish.name}
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">{auction.fish.name}</Card.Title>
          {getStatusBadge()}
        </div>
        
        <p className="text-muted mb-2">
          <strong>Species:</strong> {auction.fish.species}
        </p>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <span><strong>Current Bid:</strong> ${auction.currentBid.toFixed(2)}</span>
            <span className="text-muted">{auction.bidCount} bids</span>
          </div>
          
          {auction.status === 'active' && (
            <small className="text-success">{getTimeRemaining()}</small>
          )}
          
          {auction.status === 'completed' && auction.winner && (
            <small className="d-block"><strong>Winner:</strong> {auction.winner.name}</small>
          )}
        </div>
        
        {auction.description && (
          <p className="small text-muted mb-3">
            {auction.description.length > 80 
              ? `${auction.description.substring(0, 80)}...` 
              : auction.description
            }
          </p>
        )}
        
        <div className="mt-auto">
          <Button 
            as={Link}
            to={`/auctions/${auction._id}`}
            variant="outline-primary"
            size="sm"
            className="w-100"
          >
            {auction.status === 'active' ? 'View Auction' : 'View Details'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

AuctionCard.propTypes = {
  auction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fish: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      species: PropTypes.string,
      image: PropTypes.string
    }).isRequired,
    seller: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    currentBid: PropTypes.number.isRequired,
    bidCount: PropTypes.number,
    status: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    winner: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    }),
    description: PropTypes.string
  }).isRequired
};

export default AuctionCard; 