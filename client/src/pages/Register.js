import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    phoneNumber: '',
    address: '',
    role: 'buyer'
  });
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Clear any previous errors
    clearError();
  }, [isAuthenticated, clearError, navigate]);

  const { name, email, password, password2, phoneNumber, address, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear password error when user types in password fields
    if (e.target.name === 'password' || e.target.name === 'password2') {
      setPasswordError('');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Check if passwords match
    if (password !== password2) {
      setPasswordError('Passwords do not match');
      return;
    }

    register({
      name,
      email,
      password,
      phoneNumber,
      address,
      role
    });
  };

  return (
    <Container className="my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Register</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={onSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid email.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        minLength="6"
                        isInvalid={passwordError !== ''}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordError || 'Password must be at least 6 characters.'}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password2">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        name="password2"
                        value={password2}
                        onChange={onChange}
                        required
                        minLength="6"
                        isInvalid={passwordError !== ''}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordError || 'Please confirm your password.'}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="phoneNumber">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your phone number"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={onChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your phone number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="role">
                      <Form.Label>Register as</Form.Label>
                      <Form.Select
                        name="role"
                        value={role}
                        onChange={onChange}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter your address"
                    name="address"
                    value={address}
                    onChange={onChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Register
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <p className="mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Register; 