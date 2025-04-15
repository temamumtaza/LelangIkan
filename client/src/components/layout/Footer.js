import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="col-md-4 d-flex align-items-center">
            <span>© {new Date().getFullYear()} Lelang Ikan. All rights reserved.</span>
          </div>
          
          <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
            <li className="ms-3">
              <a className="text-white" href="#!">
                <i className="bi bi-facebook"></i>
              </a>
            </li>
            <li className="ms-3">
              <a className="text-white" href="#!">
                <i className="bi bi-instagram"></i>
              </a>
            </li>
            <li className="ms-3">
              <a className="text-white" href="#!">
                <i className="bi bi-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 