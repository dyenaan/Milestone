import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MilestoneTracker from './pages/MilestoneTracker';
import CreateJob from './pages/CreateJob';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SystemStatus from './pages/SystemStatus';
import { AuthProvider, useAuth } from './context/AuthContext';
import AptosLogin from './components/AptosLogin';
import NetworkErrorHandler from './components/NetworkErrorHandler';
import BlockchainJobForm from './components/BlockchainJobForm';
import WalletConnector from './components/WalletConnector';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Add more thorough authentication check
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!loading && !user) {
        console.log('Protected route - Not authenticated, will redirect to login');
        setRedirecting(true);

        // Double-check localStorage before redirecting
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        const savedWalletInfo = localStorage.getItem('walletInfo');

        if (token || savedUser || savedWalletInfo) {
          console.warn('Found token/user/wallet in localStorage but context says not authenticated!',
            { hasToken: !!token, hasUser: !!savedUser, hasWallet: !!savedWalletInfo });
          // Wait a moment to see if context updates (sometimes there's a race condition)
          await new Promise(r => setTimeout(r, 500));
        }
      } else if (user) {
        // Log user information when authenticated
        console.log('Protected route - User authenticated:', user.id);
        console.log('User auth source:', user.authSource || 'not specified');
      }
    };

    checkAuthStatus();
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-center">
          <p className="text-gray-600">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (redirecting) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-2">Not authenticated</p>
            <p className="text-gray-600 text-sm">Redirecting to login...</p>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" />;
  }

  return children;
};

// Add PropTypes validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

// Add wallet route to check for wallet connection
const WalletRoute = ({ children }) => {
  const { user, walletInfo, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-center">
          <p className="text-gray-600">Loading wallet state...</p>
        </div>
      </div>
    );
  }

  if (!user || !walletInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">You need to connect your Aptos wallet to access blockchain features</p>
        </div>
        <WalletConnector />
      </div>
    );
  }

  return children;
};

// Add PropTypes validation
WalletRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/milestones" element={
            <ProtectedRoute>
              <MilestoneTracker />
            </ProtectedRoute>
          } />
          <Route path="/create-job" element={
            <ProtectedRoute>
              <CreateJob />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/system-status" element={
            <ProtectedRoute>
              <SystemStatus />
            </ProtectedRoute>
          } />
          <Route path="/login/google/callback" element={<AptosLogin />} />

          {/* New blockchain routes */}
          <Route path="/blockchain/connect" element={<WalletConnector />} />
          <Route path="/blockchain/create-job" element={
            <ProtectedRoute>
              <WalletRoute>
                <BlockchainJobForm />
              </WalletRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <NetworkErrorHandler />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 