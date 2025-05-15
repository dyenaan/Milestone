import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../services/api';
import { supabaseJobs } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const CreateJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    budget: '',
    category: 'Development',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['Development', 'Design', 'Marketing', 'Blockchain', 'Content', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs
      if (!jobData.title || !jobData.description || !jobData.budget || !jobData.deadline) {
        throw new Error('Please fill out all required fields');
      }

      // Format data for submission
      const formattedJobData = {
        ...jobData,
        budget: parseFloat(jobData.budget),
        creator_id: user.id || user.accountAddress || 'unknown_user',
        status: 'open',
      };

      let result;

      // Try to use Supabase directly if user is authenticated with Supabase
      if (user?.isSupabase) {
        const { data, error } = await supabaseJobs.createJob(formattedJobData);

        if (error) throw error;

        result = data;
      } else {
        // Fallback to API
        try {
          const response = await jobsApi.createJob(formattedJobData);
          result = response.data;
        } catch (apiError) {
          console.warn('API job creation failed, trying Supabase directly', apiError);

          // If API fails, try Supabase as fallback
          const { data, error } = await supabaseJobs.createJob(formattedJobData);
          if (error) throw error;
          result = data;
        }
      }

      setSuccess(true);

      // Reset form
      setJobData({
        title: '',
        description: '',
        budget: '',
        category: 'Development',
        deadline: '',
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);

    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate min date for deadline (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Post a New Job</h1>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Job posted successfully! Redirecting to marketplace...</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={jobData.title}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Frontend Developer Needed"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={jobData.description}
            onChange={handleChange}
            required
            rows={6}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe the job requirements, deliverables, and any specific skills needed..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget (USD) *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="budget"
                name="budget"
                value={jobData.budget}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={jobData.category}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline *
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={jobData.deadline}
            onChange={handleChange}
            required
            min={today}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Job Posting Tips</h3>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Be clear and specific about your requirements</li>
          <li>Set a realistic budget for the scope of work</li>
          <li>Include expected timeline and deliverables</li>
          <li>Mention required skills and experience level</li>
          <li>Set a reasonable deadline to attract more freelancers</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateJob; 