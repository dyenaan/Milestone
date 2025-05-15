import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseJobs, supabaseApplications } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';

// Fixed UUID for Aptos wallet users (fallback)
const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

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
          // Determine all possible identifiers for this user
          const userIdentifiers = [];

          // Check if this is an Aptos user
          const isAptosUser = user.authSource === 'aptos_keyless' ||
            (user.id && typeof user.id === 'object' && user.id.data instanceof Uint8Array) ||
            user.isKeyless ||
            (user.accountAddress && typeof user.accountAddress === 'string' && user.accountAddress.startsWith('0x'));

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

  // Function to handle reapplying for a job
  const handleReapply = (jobId) => {
    // Navigate to the job details page
    navigate(`/jobs/${jobId}?reapply=true`);
  };

  // Function to handle deleting a job
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

  // Helper function to safely display wallet address
  const formatWalletAddress = (address) => {
    if (!address) return 'Not available';

    // If it's an object with data property
    if (typeof address === 'object' && address.data instanceof Uint8Array) {
      try {
        const hexString = Array.from(address.data)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Show first 6 and last 4 characters with ellipsis in between
        const formatted = `0x${hexString.substring(0, 6)}...${hexString.substring(hexString.length - 4)}`;
        return formatted;
      } catch (err) {
        console.error('Error formatting address:', err);
        return 'Invalid address format';
      }
    }

    // If it's a string
    if (typeof address === 'string') {
      if (address.length > 16) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      }
      return address;
    }

    // Fallback
    return 'Unknown format';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Success message */}
      {actionSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 animate-pulse">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{actionSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Simplified User Welcome Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome back, {user?.username || user?.email?.split('@')[0] || user?.user_metadata?.full_name || 'User'}!
              </h2>
              <p className="text-gray-600 mt-1">Your freelance dashboard</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/profile" className="inline-flex items-center px-3 py-1.5 border border-indigo-100 rounded-md text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
            <Link to="/marketplace" className="inline-flex items-center px-3 py-1.5 border border-indigo-100 rounded-md text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Find Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Jobs Posted */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Jobs Posted</h3>
          <Link
            to="/create-job"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Post New Job
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {postedJobs.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              You haven&apos;t posted any jobs yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {postedJobs.map(job => (
                <li key={job.id} className="relative">
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Link to={`/jobs/${job.id}`}>
                          <p className="text-sm font-medium text-indigo-600 truncate">{job.title}</p>
                        </Link>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${job.status === 'open' ? 'bg-green-100 text-green-800' :
                              job.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                job.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'}`}>
                            {job.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Category: {job.category}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Budget: ${job.budget}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex space-x-2 justify-end">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedJob(job);
                            setShowDeleteJobModal(true);
                          }}
                          className="text-xs text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Job
                        </button>

                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Jobs Applied To */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Applications</h3>
            {appliedJobs.filter(app =>
              app.status === 'accepted' ||
              (app.status === 'pending' && new Date(app.created_at) > new Date(Date.now() - 86400000))
            ).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 animate-pulse">
                  {appliedJobs.filter(app =>
                    app.status === 'accepted' ||
                    (app.status === 'pending' && new Date(app.created_at) > new Date(Date.now() - 86400000))
                  ).length}
                </span>
              )}
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Congratulations banner for accepted applications */}
        {appliedJobs.some(app => app.status === 'accepted') && (
          <div className="mx-4 mt-1 mb-3 bg-green-50 border border-green-200 rounded-md p-4 animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Congratulations!</h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>One or more of your applications have been accepted. Check below for details.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="border-t border-gray-200">
          {appliedJobs.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              You haven&apos;t applied to any jobs yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {appliedJobs.map(application => (
                <li key={application.id} className="relative">
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Link to={`/jobs/${application.job_id}`}>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {application.jobs?.title || (application.job && application.job.title) || 'Job title not available'}
                          </p>
                        </Link>
                        <div className="ml-2 flex-shrink-0 flex items-center">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'}`}>
                            {application.status}
                          </p>
                          {application.status === 'accepted' && (
                            <span className="ml-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          )}
                          {application.status === 'pending' && new Date(application.created_at) > new Date(Date.now() - 86400000) && (
                            <span className="ml-1 text-xs text-blue-600 font-medium">new</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Your price: ${application.price}
                          </p>
                          {application.estimated_time && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              Estimated time: {application.estimated_time}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Applied on {new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex space-x-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDeleteModal(true);
                          }}
                          className="text-xs text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>

                        <button
                          onClick={() => handleReapply(application.job_id)}
                          className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reapply
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Delete Application Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Application</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this application? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteApplication}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedApplication(null);
                }}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Job Confirmation Modal */}
      {showDeleteJobModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Job Posting</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this job posting? This will also delete all applications to this job. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteJob}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Job'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteJobModal(false);
                  setSelectedJob(null);
                }}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 