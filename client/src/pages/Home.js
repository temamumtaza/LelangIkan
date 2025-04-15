import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Lelang Ikan Online</h1>
              <p className="lead">
                Platform lelang ikan digital yang menghubungkan nelayan langsung dengan pembeli.
                Dapatkan ikan segar dengan harga terbaik melalui sistem lelang yang transparan.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                <Link to="/marketplace" className="btn btn-light btn-lg px-4 me-md-2">
                  Jelajahi Marketplace
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                  Daftar Sekarang
                </Link>
              </div>
            </Col>
            <Col md={6} className="text-center">
              <img 
                src="https://via.placeholder.com/500x300?text=Lelang+Ikan" 
                alt="Lelang Ikan" 
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features */}
      <Container className="py-5">
        <h2 className="text-center mb-5">Keunggulan Platform Kami</h2>
        <Row>
          <Col lg={4} md={6} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="feature-icon mb-3">
                  <i className="bi bi-graph-up" style={{ fontSize: '3rem', color: '#007bff' }}></i>
                </div>
                <Card.Title>Lelang Transparan</Card.Title>
                <Card.Text>
                  Sistem lelang yang transparan dengan proses penawaran yang dapat dipantau secara real-time.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={6} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="feature-icon mb-3">
                  <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                </div>
                <Card.Title>Jaminan Kualitas</Card.Title>
                <Card.Text>
                  Setiap penjual dan produk diverifikasi untuk memastikan kualitas produk yang diperdagangkan.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={6} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="feature-icon mb-3">
                  <i className="bi bi-people" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                </div>
                <Card.Title>Komunitas Perikanan</Card.Title>
                <Card.Text>
                  Terhubung langsung dengan komunitas nelayan dan pelaku industri perikanan di seluruh Indonesia.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* How It Works */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Cara Kerja</h2>
          <Row className="g-4">
            <Col md={3} className="text-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <h3>1</h3>
              </div>
              <h5>Daftar</h5>
              <p>Buat akun sebagai pembeli atau penjual</p>
            </Col>
            <Col md={3} className="text-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <h3>2</h3>
              </div>
              <h5>Jelajahi</h5>
              <p>Temukan ikan segar atau buat lelang baru</p>
            </Col>
            <Col md={3} className="text-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <h3>3</h3>
              </div>
              <h5>Tawar</h5>
              <p>Berikan penawaran terbaik Anda</p>
            </Col>
            <Col md={3} className="text-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <h3>4</h3>
              </div>
              <h5>Dapatkan</h5>
              <p>Menangkan lelang dan dapatkan ikan segar</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action */}
      <Container className="py-5 text-center">
        <h2>Siap Memulai?</h2>
        <p className="lead mb-4">
          Bergabunglah sekarang dan dapatkan pengalaman jual beli ikan yang lebih baik
        </p>
        <Link to="/register" className="btn btn-primary btn-lg px-5">
          Daftar Sekarang
        </Link>
      </Container>
    </div>
  );
};

export default Home; 