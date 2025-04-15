import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreateFish = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [fishData, setFishData] = useState({
    name: '',
    species: '',
    age: '',
    size: '',
    color: '',
    description: '',
    image: null
  });
  
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFishData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image too large. Maximum size is 5MB.');
        return;
      }
      
      setFishData(prev => ({
        ...prev,
        image: selectedFile
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to register a fish');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      Object.keys(fishData).forEach(key => {
        if (key === 'image') {
          if (fishData.image) {
            formData.append('image', fishData.image);
          }
        } else {
          formData.append(key, fishData[key]);
        }
      });
      
      // Send request to API
      const response = await axios.post('/api/fish', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLoading(false);
      toast.success('Fish registered successfully!');
      navigate(`/fish/${response.data._id}`);
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred while registering your fish');
      toast.error('Failed to register fish');
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Register a New Fish</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fish Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={fishData.name}
                        onChange={handleChange}
                        placeholder="Enter fish name"
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Species</Form.Label>
                      <Form.Control
                        type="text"
                        name="species"
                        value={fishData.species}
                        onChange={handleChange}
                        placeholder="Enter species (e.g., Koi, Goldfish)"
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Age (years)</Form.Label>
                      <Form.Control
                        type="number"
                        name="age"
                        value={fishData.age}
                        onChange={handleChange}
                        placeholder="Enter age in years"
                        min="0"
                        step="0.5"
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Size (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="size"
                        value={fishData.size}
                        onChange={handleChange}
                        placeholder="Enter size in centimeters"
                        min="0"
                        step="0.1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        type="text"
                        name="color"
                        value={fishData.color}
                        onChange={handleChange}
                        placeholder="Enter color(s)"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={fishData.description}
                        onChange={handleChange}
                        placeholder="Enter fish description"
                        rows={3}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Fish Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Form.Text className="text-muted">
                        Upload a clear image of your fish. Maximum size: 5MB
                      </Form.Text>
                    </Form.Group>
                    
                    {preview && (
                      <div className="mt-3 text-center">
                        <h6>Image Preview:</h6>
                        <img
                          src={preview}
                          alt="Fish preview"
                          className="img-thumbnail"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </Col>
                </Row>
                
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
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Fish'}
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

export default CreateFish; 