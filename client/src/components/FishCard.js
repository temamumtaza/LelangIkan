import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const FishCard = ({ fish, showActions }) => {
  const navigate = useNavigate();
  
  // Check if fish has a default image
  const imageUrl = fish.image 
    ? fish.image 
    : 'https://via.placeholder.com/300x200?text=No+Image';
  
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img 
        variant="top" 
        src={imageUrl} 
        alt={fish.name}
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0">{fish.name}</Card.Title>
          {fish.isInAuction && (
            <Badge bg="warning" text="dark">In Auction</Badge>
          )}
        </div>
        
        <p className="text-muted mb-1">
          <strong>Species:</strong> {fish.species}
        </p>
        
        <div className="mb-2">
          <small className="d-flex justify-content-between mb-1">
            <span><strong>Age:</strong> {fish.age} years</span>
            <span><strong>Size:</strong> {fish.size} cm</span>
          </small>
          
          {fish.color && (
            <small className="d-block mb-1">
              <strong>Color:</strong> {fish.color}
            </small>
          )}
        </div>
        
        {fish.description && (
          <p className="small text-muted mb-3">
            {fish.description.length > 100 
              ? `${fish.description.substring(0, 100)}...` 
              : fish.description
            }
          </p>
        )}
        
        {showActions && (
          <div className="mt-auto d-flex justify-content-between">
            <Button
              as={Link}
              to={`/fish/${fish._id}`}
              variant="outline-primary"
              size="sm"
            >
              View Details
            </Button>
            
            {!fish.isInAuction && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/create-auction?fish=${fish._id}`)}
              >
                Start Auction
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

FishCard.propTypes = {
  fish: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    age: PropTypes.number,
    size: PropTypes.number,
    color: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    isInAuction: PropTypes.bool
  }).isRequired,
  showActions: PropTypes.bool
};

FishCard.defaultProps = {
  showActions: false
};

export default FishCard; 