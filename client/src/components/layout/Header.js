import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout, switchRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async (newRole) => {
    try {
      await switchRole(newRole);
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  };

  const guestLinks = (
    <>
      <Nav.Link as={Link} to="/login">Login</Nav.Link>
      <Nav.Link as={Link} to="/register">Register</Nav.Link>
    </>
  );

  const authLinks = (
    <>
      {/* Role Switch */}
      {user && user.role !== 'admin' && (
        <NavDropdown
          title={`Mode: ${user.role === 'seller' ? 'Penjual' : 'Pembeli'}`}
          id="role-dropdown"
        >
          <NavDropdown.Item 
            onClick={() => handleSwitchRole('seller')}
            active={user.role === 'seller'}
          >
            Mode Penjual
          </NavDropdown.Item>
          <NavDropdown.Item 
            onClick={() => handleSwitchRole('buyer')}
            active={user.role === 'buyer'}
          >
            Mode Pembeli
          </NavDropdown.Item>
        </NavDropdown>
      )}
      
      {/* User Dropdown */}
      <NavDropdown 
        title={
          <span>
            {user && user.name}
            {user && user.verified && (
              <Badge bg="success" className="ms-1">
                Verified
              </Badge>
            )}
          </span>
        } 
        id="user-dropdown"
      >
        <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
        {(user && (user.role === 'seller' || user.role === 'admin')) && (
          <NavDropdown.Item as={Link} to="/fish/create">Tambah Ikan</NavDropdown.Item>
        )}
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
      </NavDropdown>
    </>
  );

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Lelang Ikan</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Beranda</Nav.Link>
            <Nav.Link as={Link} to="/marketplace">Marketplace</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? authLinks : guestLinks}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 