import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateFish from './pages/CreateFish';
import CreateAuction from './pages/CreateAuction';
import AuctionList from './pages/AuctionList';
import AuctionDetail from './pages/AuctionDetail';
import FishDetail from './pages/FishDetail';
import NotFound from './pages/NotFound';

// Private Route Component
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auctions" element={<AuctionList />} />
              <Route path="/auctions/:id" element={<AuctionDetail />} />
              <Route path="/fish/:id" element={<FishDetail />} />
              
              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute />}>
                <Route path="" element={<Dashboard />} />
              </Route>
              <Route path="/create-fish" element={<PrivateRoute />}>
                <Route path="" element={<CreateFish />} />
              </Route>
              <Route path="/create-auction" element={<PrivateRoute />}>
                <Route path="" element={<CreateAuction />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App; 