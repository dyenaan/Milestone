import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../services/api';
import { supabaseJobs, supabaseMilestones } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const CreateJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    budget: '',
    category: 'Development',
    deadline: '',
  });
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['Development', 'Design', 'Marketing', 'Blockchain', 'Content', 'Other'];

  // Check if user has a wallet
  useEffect(() => {
    if (!user) {
      setError("You need to connect your wallet to post a job");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMilestone = () => {
    const newMilestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      amount: 0,
      deadline: '',
      status: 'pending',
    };

    setMilestones([...milestones, newMilestone]);
  };

  // Define handleGenerateMilestones first before using it in useEffect
  const handleGenerateMilestones = useCallback(() => {
    // Generate default milestones based on job type and budget
    const defaultMilestones = [];

    // Check if we have a valid deadline
    if (!jobData.deadline) {
      return;
    }

    // Calculate evenly spaced deadlines
    const currentDate = new Date();
    const jobDeadline = new Date(jobData.deadline);

    // Validate the deadline date
    if (isNaN(jobDeadline.getTime())) {
      console.error('Invalid job deadline:', jobData.deadline);
      return;
    }

    const totalDays = Math.max(1, Math.floor((jobDeadline - currentDate) / (1000 * 60 * 60 * 24)));

    try {
      // Create milestone for initial deposit - 20% of budget
      const initialDate = new Date(currentDate.getTime() + Math.ceil(totalDays * 0.1) * 24 * 60 * 60 * 1000);
      defaultMilestones.push({
        id: `gen-${Date.now()}-1`,
        title: 'Initial deposit',
        description: 'Payment on contract signing to initiate the project.',
        amount: Math.round(Number(jobData.budget) * 0.2),
        deadline: initialDate.toISOString().split('T')[0],
        status: 'pending',
      });

      // Create milestone for midpoint delivery - 30% of budget
      const midpointDate = new Date(currentDate.getTime() + Math.ceil(totalDays * 0.5) * 24 * 60 * 60 * 1000);
      defaultMilestones.push({
        id: `gen-${Date.now()}-2`,
        title: 'Midpoint delivery',
        description: 'Payment upon completion of core functionality or halfway point.',
        amount: Math.round(Number(jobData.budget) * 0.3),
        deadline: midpointDate.toISOString().split('T')[0],
        status: 'pending',
      });

      // Create milestone for final delivery - 50% of budget
      defaultMilestones.push({
        id: `gen-${Date.now()}-3`,
        title: 'Final delivery',
        description: 'Final payment upon project completion and delivery.',
        amount: Math.round(Number(jobData.budget) * 0.5),
        deadline: jobData.deadline,
        status: 'pending',
      });

      setMilestones(defaultMilestones);
    } catch (error) {
      console.error('Error generating milestones:', error);
    }
  }, [jobData.budget, jobData.deadline]);

  // Generate default milestones when budget changes
  useEffect(() => {
    if (jobData.budget && Number(jobData.budget) > 0) {
      handleGenerateMilestones();
    }
  }, [jobData.budget, handleGenerateMilestones]);

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index][field] = value;
    setMilestones(updatedMilestones);
  };

  const removeMilestone = (index) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };

  const validateMilestones = () => {
    // Check if there are any milestones
    if (milestones.length === 0) {
      return false;
    }

    // Check if all milestones have required fields
    const allValid = milestones.every(milestone =>
      milestone.title &&
      milestone.description &&
      milestone.amount &&
      Number(milestone.amount) > 0
    );

    // Check if total equals budget
    const totalAmount = milestones.reduce((sum, milestone) => sum + Number(milestone.amount), 0);
    const budget = Number(jobData.budget);

    if (Math.abs(totalAmount - budget) > 0.01) { // Allow small floating point difference
      setError(`Total milestone amounts (${totalAmount.toFixed(2)}) must equal the overall budget (${budget.toFixed(2)})`);
      return false;
    }

    return allValid;
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

      // Validate milestones
      if (!validateMilestones()) {
        throw new Error('Please ensure all milestones are filled out correctly and total equals budget');
      }

      // Prioritize wallet address over traditional user ID
      let creatorId = null;

      if (user) {
        if (user.accountAddress && typeof user.accountAddress === 'string') {
          // Use wallet address as primary identifier
          creatorId = user.accountAddress;
          console.log('Using wallet address:', creatorId);
        } else if (user.id && typeof user.id === 'string') {
          // Fallback to user ID if no wallet
          creatorId = user.id;
          console.log('Using user ID:', creatorId);
        } else {
          // If no proper ID, use default wallet-like format for testing
          creatorId = '0x123456789abcdef123456789abcdef123456789abcdef';
          console.log('Using default wallet address:', creatorId);
        }
      } else {
        throw new Error('Please connect your wallet to post a job');
      }

      // Format data for submission
      const formattedJobData = {
        ...jobData,
        budget: parseFloat(jobData.budget),
        creator_id: creatorId,
        status: 'open',
      };

      console.log('Submitting job with creator_id:', creatorId);

      let result;

      // Try to use Supabase directly first
      try {
        const { data, error } = await supabaseJobs.createJob(formattedJobData);

        if (error) {
          console.warn('Supabase job creation failed, trying API fallback:', error);
          throw error;
        }

        // Make sure we have valid data before proceeding
        if (!data) {
          throw new Error('No data returned from job creation');
        }

        result = data;
        console.log('Job created successfully:', result);

        // Add milestones after job is created
        if (result && result.id) {
          // Submit each milestone
          const jobId = result.id;
          for (const milestone of milestones) {
            const milestoneToSave = {
              ...milestone,
              job_id: jobId,
              amount: parseFloat(milestone.amount),
              status: 'pending'
            };

            try {
              const { data: milestoneData, error: milestoneError } = await supabaseMilestones.createMilestone(milestoneToSave);

              if (milestoneError) {
                console.warn('Supabase milestone creation failed:', milestoneError);
              } else {
                console.log('Milestone created successfully:', milestoneData);
              }
            } catch (milestoneError) {
              console.error('Error creating milestone:', milestoneError);
            }
          }
        }
      } catch (supabaseError) {
        // Fallback to API
        console.log('Trying API fallback for job creation');
        const response = await jobsApi.createJob(formattedJobData);
        result = response.data;

        // Add milestones after job is created
        if (result && result.job && result.job.id) {
          const jobId = result.job.id;
          for (const milestone of milestones) {
            const milestoneToSave = {
              ...milestone,
              amount: parseFloat(milestone.amount),
              status: 'pending'
            };

            try {
              await jobsApi.createMilestone(jobId, milestoneToSave);
            } catch (milestoneError) {
              console.error('Error creating milestone:', milestoneError);
            }
          }
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
      setMilestones([]);

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

  // Calculate total milestone amount
  const totalMilestoneAmount = milestones.reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);
  const budgetAmount = Number(jobData.budget || 0);
  const amountDifference = budgetAmount - totalMilestoneAmount;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Post a New Job</h1>

      {!user && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Connect Wallet:</strong> You need to connect your wallet to post a job. The payment will be processed through your connected wallet.
              </p>
            </div>
          </div>
        </div>
      )}

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

        {/* Milestones Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Payment Milestones</h3>

          {budgetAmount > 0 && (
            <div className="mb-4 flex justify-between text-sm">
              <span>
                Total Budget: <span className="font-medium">${budgetAmount.toFixed(2)}</span>
              </span>
              <span>
                Allocated: <span className="font-medium">${totalMilestoneAmount.toFixed(2)}</span>
              </span>
              <span className={amountDifference !== 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                {amountDifference !== 0
                  ? `Remaining: $${amountDifference.toFixed(2)}`
                  : 'All funds allocated ✓'}
              </span>
            </div>
          )}

          {milestones.map((milestone, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">Milestone {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label htmlFor={`milestone-title-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id={`milestone-title-${index}`}
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                  />
                </div>

                <div>
                  <label htmlFor={`milestone-amount-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Amount (USD) *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-xs">$</span>
                    </div>
                    <input
                      type="number"
                      id={`milestone-amount-${index}`}
                      value={milestone.amount}
                      onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      className="block w-full pl-5 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor={`milestone-description-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id={`milestone-description-${index}`}
                  value={milestone.description}
                  onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                  required
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                />
              </div>

              <div>
                <label htmlFor={`milestone-deadline-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  id={`milestone-deadline-${index}`}
                  value={milestone.deadline}
                  onChange={(e) => handleMilestoneChange(index, 'deadline', e.target.value)}
                  min={today}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAddMilestone}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Add Milestone
            </button>
          </div>

          {milestones.length === 0 && jobData.budget && (
            <div className="mt-3 text-center text-sm text-gray-500">
              Add milestones to break down your payment schedule. When you set a budget, we&apos;ll suggest a default breakdown.
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !user}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <li>Break your project into meaningful milestones to track progress</li>
        </ul>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Job Posting Tips</h3>
        <p className="text-sm text-gray-500">
          Don&apos;t worry if you don&apos;t have all the details yet. You can edit this job posting later.
        </p>
      </div>
    </div>
  );
};

export default CreateJob; 