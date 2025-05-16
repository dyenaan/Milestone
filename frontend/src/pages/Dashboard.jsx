import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseJobs, supabaseApplications } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { formatWalletAddress } from '../utils/formatters';
import WalletConnector from '../components/WalletConnector';
import { blockchainService } from '../services/blockchain';

// Fixed UUID for Aptos wallet users (fallback)
const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

// Mock dashboard data for when API calls fail
const mockDashboardStats = {
  earnings: {
    total: 12500,
    thisMonth: 3200,
    pendingPayouts: 1800
  },
  projects: {
    total: 15,
    completed: 12,
    inProgress: 3,
    success_rate: 92
  },
  milestones: {
    total: 48,
    completed: 42,
    overdue: 0,
    pending_review: 2
  }
};

// Mock notifications for when API calls fail
const mockNotifications = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received 250 USD for completing "Smart Contract Development"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false
  },
  {
    id: '2',
    type: 'milestone',
    title: 'Milestone Approved',
    message: 'Your milestone "Deploy to Testnet" was approved by Alex Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true
  },
  {
    id: '3',
    type: 'job',
    title: 'New Job Opportunity',
    message: 'A job matching your skills "React Native Developer" was posted',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false
  }
];

const Dashboard = () => {
  const { user, connectBlockchainWallet, walletInfo } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    jobsInProgress: 0,
    jobsCompleted: 0,
    totalEarnings: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockchainJobs, setBlockchainJobs] = useState([]);
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState(false);
  const [blockchainError, setBlockchainError] = useState(null);

  // Delete job confirmation 
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Delete application confirmation
  const [showDeleteAppModal, setShowDeleteAppModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    // If we have a wallet connected, fetch blockchain data
    if (walletInfo) {
      fetchBlockchainData();
    }
  }, [walletInfo]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all relevant dashboard data
      const [jobsData, applicationsData, notificationsData] = await Promise.all([
        supabaseJobs.getJobsByClient(user.id),
        supabaseApplications.getApplicationsByFreelancer(user.id),
        // Mock notifications for now
        Promise.resolve([
          {
            id: 1,
            message: 'Your milestone was approved',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false
          },
          {
            id: 2,
            message: 'New application received for your project',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            isRead: true
          },
          {
            id: 3,
            message: 'You received a new message',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            isRead: false
          }
        ])
      ]);

      // Update the state with the fetched data
      setJobs(jobsData || []);
      setApplications(applicationsData || []);
      setNotifications(notificationsData || []);

      // Calculate dashboard stats
      const completedJobs = (jobsData || []).filter(job => job.status === 'completed').length;
      const inProgressJobs = (jobsData || []).filter(job => job.status === 'in_progress').length;

      setStats({
        totalJobs: (jobsData || []).length,
        jobsInProgress: inProgressJobs,
        jobsCompleted: completedJobs,
        totalEarnings: 2580, // Mock data for now
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlockchainData = async () => {
    if (!walletInfo || !walletInfo.address) return;

    try {
      setIsLoadingBlockchain(true);
      setBlockchainError(null);

      // Try to get blockchain jobs
      try {
        // Use the client address to get jobs
        const jobData = await blockchainService.getJobDetails(walletInfo.address);

        if (jobData) {
          // Format job for display
          setBlockchainJobs([{
            id: jobData.client, // Use client address as ID
            title: `Job with ${formatWalletAddress(jobData.freelancer)}`,
            description: `Blockchain job with ${jobData.milestones.length} milestones`,
            budget: jobData.milestones.reduce((sum, m) => sum + m.amount, 0) / 100000000, // Convert from APT units
            status: jobData.is_active ? 'active' : 'completed',
            milestones: jobData.milestones,
            current_step: jobData.current_step,
            total_milestones: jobData.milestones.length,
            freelancer: jobData.freelancer,
            isBlockchain: true
          }]);
        }
      } catch (err) {
        console.error('Error fetching blockchain job as client:', err);
        // Try as freelancer instead
        try {
          // Use a known client address to check if this wallet is a freelancer
          // In a real app, you'd query an indexer or backend
          const knownClients = [
            // Add known client addresses here if available
          ];

          const blockchainJobsFound = [];

          for (const clientAddress of knownClients) {
            try {
              const jobData = await blockchainService.getJobDetails(clientAddress);

              if (jobData && jobData.freelancer === walletInfo.address) {
                blockchainJobsFound.push({
                  id: jobData.client,
                  title: `Job from ${formatWalletAddress(jobData.client)}`,
                  description: `Blockchain job with ${jobData.milestones.length} milestones`,
                  budget: jobData.milestones.reduce((sum, m) => sum + m.amount, 0) / 100000000,
                  status: jobData.is_active ? 'active' : 'completed',
                  milestones: jobData.milestones,
                  current_step: jobData.current_step,
                  total_milestones: jobData.milestones.length,
                  client: jobData.client,
                  isBlockchain: true
                });
              }
            } catch (clientErr) {
              console.error(`Error checking job for client ${clientAddress}:`, clientErr);
            }
          }

          if (blockchainJobsFound.length > 0) {
            setBlockchainJobs(blockchainJobsFound);
          }
        } catch (freelancerErr) {
          console.error('Error fetching blockchain jobs as freelancer:', freelancerErr);
        }
      }
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setBlockchainError('Failed to load blockchain data. Please try again.');
    } finally {
      setIsLoadingBlockchain(false);
    }
  };

  const confirmDeleteJob = (job) => {
    setJobToDelete(job);
    setShowDeleteJobModal(true);
  };

  const confirmDeleteApplication = (app) => {
    setAppToDelete(app);
    setShowDeleteAppModal(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await supabaseJobs.deleteJob(jobToDelete.id);
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      setShowDeleteJobModal(false);
      setJobToDelete(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleDeleteApplication = async () => {
    if (!appToDelete) return;

    try {
      await supabaseApplications.deleteApplication(appToDelete.id);
      setApplications(applications.filter(app => app.id !== appToDelete.id));
      setShowDeleteAppModal(false);
      setAppToDelete(null);
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application. Please try again.');
    }
  };

  const handleWalletConnect = async () => {
    try {
      const walletInfo = await connectBlockchainWallet();
      console.log('Wallet connected:', walletInfo);
      fetchBlockchainData();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* User Welcome Section */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="md:flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, Alex Johnson</h1>
            <p className="text-gray-600">
              Wallet Address: {formatWalletAddress(user?.accountAddress || user?.walletAddress || "Not Connected")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to="/create-job"
              className="block md:inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Post a Job
            </Link>
            <Link
              to="/marketplace"
              className="block md:inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Find Work
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Jobs Posted</h2>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">In Progress</h2>
              <p className="text-2xl font-semibold text-gray-800">{stats.jobsInProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Completed</h2>
              <p className="text-2xl font-semibold text-gray-800">{stats.jobsCompleted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs Posted Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Posted Jobs</h2>
              <Link to="/create-job" className="text-blue-600 hover:text-blue-800">
                + New Job
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-4">{error}</div>
            ) : jobs.length === 0 ? (
              <div className="text-gray-500 text-center py-6">
                <p>You haven't posted any jobs yet.</p>
                <Link to="/create-job" className="text-blue-600 hover:underline mt-2 inline-block">
                  Post your first job
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/jobs/${job.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800">
                          {job.title}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">{job.description.substring(0, 100)}...</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-800' :
                              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                            }`}>
                            {job.status.replace('_', ' ')}
                          </span>
                          <span className="text-gray-500 text-xs ml-3 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            ${job.budget}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDeleteJob(job)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blockchain Jobs Section */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Blockchain Jobs</h2>
              <div className="flex space-x-2">
                {walletInfo ? (
                  <Link
                    to="/blockchain/create-job"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    + New Blockchain Job
                  </Link>
                ) : (
                  <button
                    onClick={handleWalletConnect}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            {!walletInfo ? (
              <div className="text-gray-500 text-center py-6">
                <p>Connect your Aptos wallet to view and create blockchain jobs</p>
                <button
                  onClick={handleWalletConnect}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4"
                >
                  Connect Wallet
                </button>
              </div>
            ) : isLoadingBlockchain ? (
              <div className="text-center py-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : blockchainError ? (
              <div className="text-red-600 text-center py-4">{blockchainError}</div>
            ) : blockchainJobs.length === 0 ? (
              <div className="text-gray-500 text-center py-6">
                <p>You haven't created any blockchain jobs yet.</p>
                <Link to="/blockchain/create-job" className="text-blue-600 hover:underline mt-2 inline-block">
                  Create your first blockchain job
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {blockchainJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-medium text-blue-600">
                          {job.title}
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">Blockchain</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                            {job.status}
                          </span>
                          <span className="text-gray-500 text-xs ml-3 flex items-center">
                            <span className="font-mono">{job.budget} APT</span>
                          </span>
                          <span className="text-gray-500 text-xs ml-3">
                            {`Milestone ${job.current_step + 1}/${job.total_milestones}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Your Applications */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Applications</h2>

            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                <p>You haven't applied to any jobs yet.</p>
                <Link to="/marketplace" className="text-blue-600 hover:underline mt-2 inline-block">
                  Browse available jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-3">
                    <div className="flex justify-between">
                      <Link to={`/jobs/${app.job_id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {app.job_title || 'Job Title'}
                      </Link>
                      <button
                        onClick={() => confirmDeleteApplication(app)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Applied on {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
              <div className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                Mark all as read
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No new notifications</div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-3 rounded-lg ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <BellIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Job Modal */}
      {showDeleteJobModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Confirm Deletion</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this job? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteJob}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteJobModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-600 text-base font-medium rounded-md w-full border shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {showDeleteAppModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Confirm Removal</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to remove this application? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteApplication}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
                <button
                  onClick={() => setShowDeleteAppModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-600 text-base font-medium rounded-md w-full border shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 