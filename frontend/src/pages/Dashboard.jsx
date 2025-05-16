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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(mockDashboardStats);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Helper function to extract valid string identifiers
  const getValidStringIdentifier = (identifier) => {
    if (!identifier) return null;

    // If it's an object with a data property (Aptos address object)
    if (identifier && typeof identifier === 'object' && identifier.data instanceof Uint8Array) {
      // For Aptos users, return the user's UUID if available, otherwise the fixed UUID
      console.log('Using UUID for Aptos user');
      return user?.uuid || APTOS_USER_UUID;
    }

    // If it's already a string, return it directly
    if (typeof identifier === 'string') {
      return identifier;
    }

    // If we can't handle this type, return null
    console.warn('Unhandled identifier type:', typeof identifier, identifier);
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user) {
          // Fetch dashboard stats from mock service (gracefully handle failures)
          try {
            const statsResponse = await axios.get('/dashboard/stats');
            if (statsResponse.data) {
              setDashboardStats(statsResponse.data);
            }
          } catch (statsErr) {
            console.log('Using mock dashboard stats due to API error:', statsErr);
            // Already set to mock data by default, no need to set again
          }

          // Fetch notifications from mock service (gracefully handle failures)
          try {
            const notificationsResponse = await axios.get('/notifications');
            if (notificationsResponse.data) {
              setNotifications(notificationsResponse.data);
            }
          } catch (notifErr) {
            console.log('Using mock notifications due to API error:', notifErr);
            // Already set to mock data by default, no need to set again
          }

          // Determine all possible identifiers for this user
          const userIdentifiers = [];

          // Check if this is an Aptos user
          const isAptosUser = user.authSource === 'aptos_keyless' ||
            (user.id && typeof user.id === 'object' && user.id.data instanceof Uint8Array) ||
            user.isKeyless ||
            (user.accountAddress && typeof user.accountAddress === 'string' && user.accountAddress.startsWith('0x')) ||
            user.isAptos ||
            user.authMethod === 'google_aptos';

          // If it's an Aptos user, always use the fixed UUID
          if (isAptosUser) {
            userIdentifiers.push(APTOS_USER_UUID);
            console.log('Using fixed UUID for Aptos user:', APTOS_USER_UUID);

            // Also add the wallet address as a possible identifier (for backward compatibility)
            if (user.accountAddress) {
              const address = getValidStringIdentifier(user.accountAddress);
              if (address && !userIdentifiers.includes(address)) {
                userIdentifiers.push(address);
              }
            }
          } else {
            // Handle the ID properly for non-Aptos users
            const userId = getValidStringIdentifier(user.id);
            if (userId) {
              userIdentifiers.push(userId);
            }

            // Add wallet address if available for non-Aptos users
            if (user.walletAddress || user.accountAddress) {
              const walletAddress = getValidStringIdentifier(user.walletAddress || user.accountAddress);
              if (walletAddress && !userIdentifiers.includes(walletAddress)) {
                userIdentifiers.push(walletAddress);
              }
            }

            // Add wallet-like format of the UUID
            if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
              const hexId = '0x' + userId.replace(/-/g, '');
              if (!userIdentifiers.includes(hexId)) {
                userIdentifiers.push(hexId);
              }
            }
          }

          console.log('Valid user identifiers for queries:', userIdentifiers);

          // Fetch jobs for all possible identifiers
          let allPostedJobs = [];
          let postedJobsErrors = [];

          for (const identifier of userIdentifiers) {
            try {
              const { data: jobs, error } = await supabaseJobs.getJobs({ creator_id: identifier });

              if (error) {
                postedJobsErrors.push(error.message);
                console.error('Error fetching posted jobs:', error);
              } else if (jobs && jobs.length > 0) {
                allPostedJobs = [...allPostedJobs, ...jobs];
              }
            } catch (err) {
              console.error('Unexpected error fetching posted jobs:', err);
              postedJobsErrors.push(err.message);
            }
          }

          // Remove duplicates by job ID
          const uniqueJobs = Array.from(
            new Map(allPostedJobs.map(job => [job.id, job])).values()
          );

          setPostedJobs(uniqueJobs);

          // Fetch jobs applied to by the user (all possible identifiers)
          let allApplications = [];
          let appliedJobsErrors = [];

          for (const identifier of userIdentifiers) {
            try {
              const { data: applications, error } = await supabaseApplications.getApplicationsByUserId(identifier);

              if (error) {
                appliedJobsErrors.push(error.message);
                console.error('Error fetching job applications:', error);
              } else if (applications && applications.length > 0) {
                allApplications = [...allApplications, ...applications];
              }
            } catch (err) {
              console.error('Unexpected error fetching applications:', err);
              appliedJobsErrors.push(err.message);
            }
          }

          // Remove duplicates by application ID
          const uniqueApplications = Array.from(
            new Map(allApplications.map(app => [app.id, app])).values()
          );

          setAppliedJobs(uniqueApplications);

          // Set error if any occurred
          if (postedJobsErrors.length > 0 || appliedJobsErrors.length > 0) {
            setError('Some data could not be loaded. Please refresh to try again.');
          }
        } else {
          setError('User not authenticated. Please log in.');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Function to format numbers with comma separators
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to handle deleting an application
  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);

    try {
      const { error } = await supabaseApplications.deleteApplication(selectedApplication.id);

      if (error) {
        throw error;
      }

      // Remove from the local state
      setAppliedJobs(appliedJobs.filter(app => app.id !== selectedApplication.id));
      setActionSuccess('Application successfully deleted!');

      // Hide the modal
      setShowDeleteModal(false);
      setSelectedApplication(null);

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReapply = (jobId) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    setActionLoading(true);

    try {
      const { error } = await supabaseJobs.deleteJob(selectedJob.id);

      if (error) {
        throw error;
      }

      // Remove from the local state
      setPostedJobs(postedJobs.filter(job => job.id !== selectedJob.id));
      setActionSuccess('Job successfully deleted!');

      // Hide the modal
      setShowDeleteJobModal(false);
      setSelectedJob(null);

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Render dashboard UI
  return (
    <div className="container mx-auto px-4 py-8">
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
              className="block md:inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-10a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {actionSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Dashboard Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Earnings Card */}
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                    <p className="text-lg font-semibold text-gray-800">${formatNumber(dashboardStats?.earnings?.total || 0)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-xs font-medium text-gray-800">${formatNumber(dashboardStats?.earnings?.thisMonth || 0)}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-xs font-medium text-gray-800">${formatNumber(dashboardStats?.earnings?.pendingPayouts || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Projects Card */}
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                    <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Projects</p>
                    <p className="text-lg font-semibold text-gray-800">{dashboardStats?.projects?.total || 0}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-xs font-medium text-gray-800">{dashboardStats?.projects?.completed || 0}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-xs font-medium text-gray-800">{dashboardStats?.projects?.inProgress || 0}</p>
                  </div>
                </div>
              </div>

              {/* Milestones Card */}
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                    <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Milestones</p>
                    <p className="text-lg font-semibold text-gray-800">{dashboardStats?.milestones?.total || 0}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-xs font-medium text-gray-800">{dashboardStats?.milestones?.completed || 0}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Pending Review</p>
                    <p className="text-xs font-medium text-gray-800">{dashboardStats?.milestones?.pending_review || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No notifications yet.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          {notification.type === 'payment' && (
                            <div className="rounded-full bg-green-100 p-1">
                              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          {notification.type === 'milestone' && (
                            <div className="rounded-full bg-purple-100 p-1">
                              <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                            </div>
                          )}
                          {notification.type === 'job' && (
                            <div className="rounded-full bg-blue-100 p-1">
                              <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          {notification.type === 'reminder' && (
                            <div className="rounded-full bg-amber-100 p-1">
                              <ClockIcon className="h-5 w-5 text-amber-600" />
                            </div>
                          )}
                          {notification.type === 'alert' && (
                            <div className="rounded-full bg-red-100 p-1">
                              <BellIcon className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 ml-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Main content - Posted jobs and applications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Jobs You've Posted</h2>
              {postedJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-500">You haven't posted any jobs yet.</p>
                  <Link
                    to="/create-job"
                    className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Post a Job
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {postedJobs.map((job) => (
                      <li key={job.id} className="p-4 hover:bg-gray-50">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-indigo-600">{job.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ${job.budget}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{job.description}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>Posted on {formatDate(job.created_at)}</span>
                            <span className="mx-2">&middot;</span>
                            <span>{job.applications?.length || 0} applications</span>
                          </div>
                          <div className="mt-3 flex space-x-3">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowDeleteJobModal(true);
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Delete Job
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Job Applications</h2>
              {appliedJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                  <Link
                    to="/marketplace"
                    className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {appliedJobs.map((application) => (
                      <li key={application.id} className="p-4 hover:bg-gray-50">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-indigo-600">{application.job?.title || 'Job'}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{application.cover_letter}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>Applied on {formatDate(application.created_at)}</span>
                          </div>
                          <div className="mt-3 flex space-x-3">
                            <Link
                              to={`/jobs/${application.job_id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View Job
                            </Link>
                            {application.status === 'rejected' && (
                              <button
                                onClick={() => handleReapply(application.job_id)}
                                className="text-sm font-medium text-green-600 hover:text-green-500"
                              >
                                Reapply
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowDeleteModal(true);
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Delete Application
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Job Modal */}
      {showDeleteJobModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Job</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this job? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteJobModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteJob}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Application</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this application? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApplication}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
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