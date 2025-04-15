import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Halaman Tidak Ditemukan</h2>
          <p className="lead mb-5">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau URL yang Anda masukkan salah.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Kembali ke Beranda
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
