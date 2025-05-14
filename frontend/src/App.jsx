import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import JobBrowser from './pages/JobBrowser';
import MilestoneTracker from './pages/MilestoneTracker';
import CreateJob from './pages/CreateJob';
import JobDetails from './pages/JobDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobBrowser />} />
            <Route path="/milestones" element={<MilestoneTracker />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 