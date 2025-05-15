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

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Add more thorough authentication check
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!loading && !isAuthenticated) {
        console.log('Protected route - Not authenticated, will redirect to login');
        setRedirecting(true);

        // Double-check localStorage before redirecting
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token || savedUser) {
          console.warn('Found token/user in localStorage but context says not authenticated!',
            { hasToken: !!token, hasUser: !!savedUser });
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
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-center">
          <p className="text-gray-600">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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

// Add PropTypes for AuthRoute
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Add PropTypes validation
AuthRoute.propTypes = {
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