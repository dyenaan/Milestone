import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobsApi } from '../services/api';
import { supabaseJobs } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
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

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      let jobData;

      // Try to get job from Supabase directly first
      if (user?.isSupabase) {
        const { data, error } = await supabaseJobs.getJobById(id);

        if (error) throw error;

        jobData = data;
      } else {
        // Fallback to API
        try {
          const response = await jobsApi.getJobById(id);
          jobData = response.data;
        } catch (apiError) {
          console.warn('API fetch failed, trying Supabase directly', apiError);

          // If API fails, try Supabase as fallback
          const { data, error } = await supabaseJobs.getJobById(id);
          if (error) throw error;
          jobData = data;
        }
      }

      // If no job found and ID starts with 'mock', use mock data
      if (!jobData && id.startsWith('mock')) {
        jobData = getMockJob(id);
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

  const getMockJob = (mockId) => {
    const mockJobs = {
      'mock-1': {
        id: 'mock-1',
        title: 'Frontend Developer Needed',
        description: 'Looking for a skilled frontend developer to build a responsive web application. The ideal candidate should have experience with React, TailwindCSS, and modern JavaScript. This project involves creating a dashboard interface with various data visualization components and ensuring it works well on all devices.\n\nThe successful developer will work closely with our design and backend teams to integrate APIs and implement UI designs with a focus on performance and accessibility.',
        budget: 2000,
        category: 'Development',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        status: 'open',
        creator_id: 'mock-user-1',
        creator: {
          name: 'John Smith',
          email: 'john@example.com',
          company: 'TechStartup Inc.'
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      },
      'mock-2': {
        id: 'mock-2',
        title: 'Logo Design for Startup',
        description: 'Need a professional logo for a new tech startup in the AI space. We\'re looking for a modern, clean design that communicates innovation and trustworthiness. The logo should work well in both color and monochrome, and be scalable for various media (web, print, merchandise).\n\nPlease include examples of your previous logo work in your proposal. We\'ll need the final deliverables in vector format (AI/EPS/SVG) as well as PNG versions in various sizes.',
        budget: 500,
        category: 'Design',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        status: 'open',
        creator_id: 'mock-user-2',
        creator: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          company: 'AI Solutions'
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
      },
      'mock-3': {
        id: 'mock-3',
        title: 'Smart Contract Development',
        description: 'Develop a smart contract for an NFT marketplace on Aptos. The contract should handle minting, listing, bidding, and trading of NFTs with royalty payments to original creators. Security is a top priority, so experience with auditing and best practices is essential.\n\nThe contract should be optimized for gas efficiency and include comprehensive tests. Documentation for both developers and end-users will be required.',
        budget: 3000,
        category: 'Blockchain',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
        status: 'open',
        creator_id: 'mock-user-3',
        creator: {
          name: 'Robert Chen',
          email: 'robert@example.com',
          company: 'BlockchainX'
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      }
    };

    return mockJobs[mockId] || null;
  };

  const handleProposalChange = (e) => {
    const { name, value } = e.target;
    setProposal(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      // In a real implementation, we would submit to an API or Supabase
      console.log('Submitting proposal for job', id, proposal);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitSuccess(true);

      // Reset form
      setProposal({
        coverLetter: '',
        price: '',
        estimatedTime: '',
      });

      // Close the application form after delay
      setTimeout(() => {
        setApplying(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setError('Failed to submit proposal. Please try again.');
    } finally {
      setApplying(false);
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
          <p className="text-gray-500">The job you're looking for doesn't exist or has been removed.</p>
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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {job.status}
            </span>
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
              <button
                onClick={() => setApplying(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply for this Job
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Your Proposal</h3>

              {submitSuccess && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Your proposal has been submitted successfully!</p>
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

      {id.startsWith('mock') && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> This is demo data. Connect your Supabase database to see and apply to real jobs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetails; 