import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabaseJobs, supabaseApplications } from '../services/supabase';
import { checkAuth, getCurrentUser } from '../utils/authRedirect';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    price: '',
    estimatedTime: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  // Check if user came to reapply
  const urlParams = new URLSearchParams(location.search);
  const shouldReapply = urlParams.get('reapply') === 'true';

  // Check authentication status
  useEffect(() => {
    async function checkAuthStatus() {
      const authStatus = await checkAuth(navigate, true); // true = silent mode, don't redirect
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const user = await getCurrentUser();
        setCurrentUser(user); // Store user in state
        console.log('Current user:', user);
      }
    }

    checkAuthStatus();
  }, [navigate]);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  // Use currentUser to display user-specific job information
  useEffect(() => {
    // If we have both job and user data, we can check if this is the user's job
    if (job && currentUser) {
      const userIsCreator = job.creator_id === currentUser.id ||
        job.creator_id === currentUser.accountAddress;

      setIsCreator(userIsCreator);
      console.log('User is the creator of this job:', userIsCreator);

      // Auto-open application form if reapplying
      if (shouldReapply && !userIsCreator && isAuthenticated) {
        setApplying(true);
      }
    }
  }, [job, currentUser, shouldReapply, isAuthenticated]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      let jobData;

      // Try to get job from Supabase directly
      try {
        const { data, error } = await supabaseJobs.getJobById(id);
        if (error) throw error;
        jobData = data;
      } catch (err) {
        console.error('Error fetching job from Supabase:', err);
        throw new Error('Failed to load job details');
      }

      if (!jobData) {
        throw new Error('Job not found');
      }

      setJob(jobData);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalChange = (e) => {
    const { name, value } = e.target;
    setProposal(prev => ({ ...prev, [name]: value }));
  };

  // Utility function to format Aptos addresses
  const formatAptosAddress = (address) => {
    if (typeof address === 'string') {
      return address.startsWith('0x') ? address : `0x${address}`;
    }

    if (address && typeof address === 'object') {
      if (address.data && Array.isArray(address.data)) {
        return '0x' + Array.from(address.data)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }

      if (address.toString && typeof address.toString === 'function') {
        const strValue = address.toString();
        return strValue.startsWith('0x') ? strValue : `0x${strValue}`;
      }
    }

    return `0x${address}`;
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError(null);

    try {
      // Use our new auth check
      const isLoggedIn = await checkAuth(navigate, true);

      if (!isLoggedIn) {
        throw new Error('You need to be logged in to apply for a job. Please login or sign up first.');
      }

      // Get the current user from any auth source
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('Unable to get user information. Please try logging in again.');
      }

      // Fixed UUID for all Aptos wallet users
      const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

      // Determine the best ID to use (Aptos or Supabase)
      let applicantId;

      if (user.accountAddress || user.isKeyless) {
        // This is an Aptos user - use the fixed UUID
        applicantId = APTOS_USER_UUID;
        console.log('Using fixed UUID for Aptos wallet application:', applicantId);
      } else if (user.id) {
        // This is a Supabase user
        applicantId = user.id;
        console.log('Using Supabase user ID for application:', applicantId);
      } else {
        throw new Error('Could not determine user ID. Please check your login status.');
      }

      // Final validation
      if (!applicantId) {
        throw new Error('Failed to determine a valid applicant ID. Please log out and log in again.');
      }

      // Create application data
      const applicationData = {
        job_id: id,
        applicant_id: applicantId,
        cover_letter: proposal.coverLetter,
        price: parseFloat(proposal.price),
        estimated_time: proposal.estimatedTime,
        status: 'pending'
      };

      console.log('Submitting application with data:', applicationData);

      // Submit application via Supabase
      const { error } = await supabaseApplications.createApplication(applicationData);
      if (error) {
        throw error;
      }

      setSubmitSuccess(true);

      // Reset form
      setProposal({
        coverLetter: '',
        price: '',
        estimatedTime: '',
      });

      // Redirect to dashboard after showing success message
      setTimeout(() => {
        setApplying(false);
        setSubmitSuccess(false);
        navigate('/dashboard'); // Redirect to dashboard
      }, 5000);
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setError(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Add function to handle job actions for creator
  const handleUpdateJobStatus = async (newStatus) => {
    if (!isCreator) return;

    try {
      const { error } = await supabaseJobs.updateJob(job.id, { status: newStatus });

      if (error) {
        throw error;
      }

      // Refresh job data
      setJob({
        ...job,
        status: newStatus
      });

    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Failed to update job status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Link
                  to="/marketplace"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Back to Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
          <p className="text-gray-500">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <div className="mt-6">
            <Link
              to="/marketplace"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/marketplace"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
        >
          <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Posted {new Date(job.created_at).toLocaleDateString()} • {job.category}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${job.status === 'open' ? 'bg-green-100 text-green-800' :
                  job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'}`}>
                {job.status}
              </span>

              {/* Display creator-specific options */}
              {isCreator && (
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      id="options-menu"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={() => {
                        const dropdown = document.getElementById('dropdown-menu');
                        if (dropdown) {
                          dropdown.classList.toggle('hidden');
                        }
                      }}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  <div
                    id="dropdown-menu"
                    className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <div className="py-1" role="none">
                      <button
                        onClick={() => handleUpdateJobStatus('open')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        Mark as Open
                      </button>
                      <button
                        onClick={() => handleUpdateJobStatus('in-progress')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        Mark as In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateJobStatus('completed')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Budget</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">${job.budget}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Deadline</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(job.deadline).toLocaleDateString()}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Client</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.creator?.name || 'Anonymous'}{job.creator?.company ? ` (${job.creator.company})` : ''}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Contact</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.creator?.email || 'Contact through platform'}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-600">
                {job.description || "The job creator hasn&apos;t provided a detailed description for this job yet. If you&apos;re interested, please contact them for more details."}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {!applying ? (
            <div className="flex justify-end">
              {isAuthenticated && !isCreator ? (
                <button
                  onClick={() => setApplying(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply for this Job
                </button>
              ) : isCreator ? (
                <div className="text-sm text-gray-600 italic">
                  This is your job posting
                </div>
              ) : (
                <div className="text-center w-full">
                  <p className="mb-4 text-gray-600">You need to be logged in to apply for this job</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 relative">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Your Proposal</h3>

              {submitSuccess && (
                <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex flex-col items-center justify-center rounded-lg transition-all duration-500 ease-in-out transform scale-100">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-green-100 p-3 mb-4">
                      <svg className="h-12 w-12 text-green-600 animate-bounce" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2 animate-pulse">Application Submitted!</h3>
                    <p className="text-green-700 mb-4">Your proposal has been sent to the employer</p>
                    <div className="w-16 h-1 bg-green-500 mb-4 animate-pulse"></div>
                    <p className="text-sm text-gray-600 mb-2">Redirecting to your dashboard...</p>
                    <div className="flex justify-center items-center space-x-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitProposal} className="space-y-6">
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                    Cover Letter
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      rows={4}
                      required
                      value={proposal.coverLetter}
                      onChange={handleProposalChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Explain why you&apos;re a good fit for this job..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Your Price (USD)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        value={proposal.price}
                        onChange={handleProposalChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        aria-describedby="price-currency"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                      Estimated Time (days)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="estimatedTime"
                        id="estimatedTime"
                        required
                        value={proposal.estimatedTime}
                        onChange={handleProposalChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Number of days"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setApplying(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Proposal
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetails; 