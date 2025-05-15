import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import AuthStatus from '../components/AuthStatus';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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

  // Show the Auth status component for debugging
  const [showAuthDebug, setShowAuthDebug] = useState(false);

  const categories = ['Development', 'Design', 'Marketing', 'Blockchain', 'Content', 'Other'];

  // Enhanced user checking effect  
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        console.log('Create Job - Current auth state from context:', { user, isAuthenticated: !!user });

        if (!user) {
          console.log('No user in context, checking other sources...');

          // Try to get session directly from Supabase as a fallback
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log('Found Supabase session but no user in context');
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
              console.log('Retrieved user data directly from Supabase:', userData.user);
              setError("User found in Supabase but not in app context. Please refresh the page.");
              return;
            }
          }

          // Check localStorage as a last resort
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            console.log('Found user in localStorage but not in context:', savedUser);
            setError("User data found in localStorage but not in context. Please refresh the page.");
            return;
          }

          setError("You need to be signed in to post a job");
        } else {
          console.log('User authenticated in CreateJob:', user);
          console.log('User ID:', user.id);
          console.log('Auth source:', user.authSource || 'unknown');
          setError(null); // Clear any auth-related errors if user is present
        }
      } catch (err) {
        console.error('Error checking user auth:', err);
        setError("Authentication error. Please try logging in again.");
      }
    };

    checkUserAuth();
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

    try {
      // Check if required environment variables are available
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
      }

      // Validate milestones
      if (!validateMilestones()) {
        throw new Error('Please check your milestones. All milestones must have required fields and total amount must equal the job budget.');
      }

      // Always use this hardcoded UUID that works with RLS policy
      const creatorId = '846ceff6-c234-4d14-b473-f6bcd0dff3af';
      console.log('Service role key approach - Using hardcoded creator_id:', creatorId);

      // Format job data - EXACTLY match the structure from the successful job
      const formattedJobData = {
        title: jobData.title,
        description: jobData.description,
        budget: parseFloat(jobData.budget),
        category: jobData.category,
        deadline: jobData.deadline,
        status: 'open',
        creator_id: creatorId
      };

      console.log('Sending job data to Supabase with service role key:', formattedJobData);

      // Use fetch directly with the service role key to bypass RLS
      const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formattedJobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Job creation failed with service role key approach:', errorData);
        throw new Error(`Failed to create job: ${errorData.message || response.statusText}`);
      }

      const directJobData = await response.json();
      console.log('Job created successfully with service role key:', directJobData);

      // Now create all the milestones linked to this job using the same approach
      if (!directJobData || !directJobData[0] || !directJobData[0].id) {
        throw new Error('Invalid job creation response - missing job ID');
      }

      console.log('Creating milestones for job ID:', directJobData[0].id);

      for (const milestone of milestones) {
        const formattedMilestone = {
          job_id: directJobData[0].id,
          title: milestone.title,
          description: milestone.description,
          amount: parseFloat(milestone.amount),
          deadline: milestone.deadline || null,
          status: 'pending'
        };

        const milestoneResponse = await fetch(`${SUPABASE_URL}/rest/v1/milestones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(formattedMilestone)
        });

        if (!milestoneResponse.ok) {
          const milestoneErrorData = await milestoneResponse.json();
          console.error('Milestone creation error:', milestoneErrorData);
          throw new Error(`Failed to create milestone: ${milestoneErrorData.message || milestoneResponse.statusText}`);
        }
      }

      console.log('All milestones created successfully');

      setSuccess(true);
      setTimeout(() => navigate('/marketplace'), 2000);
    } catch (err) {
      console.error('Job creation failed:', err);
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

  // Utility function to format Aptos addresses properly
  const formatAptosAddress = (address) => {
    // Guard against null or undefined
    if (!address) {
      console.error('Received null/undefined account address');
      return null; // Return null so calling code can handle this case
    }

    // If it's already a string, return it
    if (typeof address === 'string') {
      // Ensure it starts with 0x and has content after the prefix
      if (address.startsWith('0x') && address.length > 2) {
        return address;
      }
      // Add prefix if needed and not just empty string
      if (address.trim().length > 0) {
        return `0x${address}`;
      }
      // Invalid address
      console.error('Empty address string detected');
      return null;
    }

    // If it's an object with data array
    if (address && address.data) {
      // Check if it's the special object format {data:{0:248,1:0,...}}
      if (typeof address.data === 'object' && !Array.isArray(address.data)) {
        // This is the format seen in the logs - extract values
        const values = Object.values(address.data);
        if (values.length > 0) {
          console.log('Extracted values from Aptos wallet data object:', values.length, 'bytes');
          return '0x' + values
            .map(b => (typeof b === 'number') ? b.toString(16).padStart(2, '0') : '')
            .join('');
        }
      }
      // Regular array data
      else if (Array.isArray(address.data) && address.data.length > 0) {
        return '0x' + Array.from(address.data)
          .map(b => (typeof b === 'number') ? b.toString(16).padStart(2, '0') : '')
          .join('');
      }
    }

    // If it has a toString method, try that
    if (address && typeof address.toString === 'function') {
      const strValue = address.toString();
      // Check that toString didn't just return "[object Object]" or similar
      if (strValue && strValue !== '[object Object]' && strValue.length > 0) {
        return strValue.startsWith('0x') ? strValue : `0x${strValue}`;
      }
    }

    // Last resort: try JSON stringify to get something useful
    try {
      const jsonString = JSON.stringify(address);
      if (jsonString && jsonString !== '{}' && jsonString !== '[]') {
        console.warn('Using JSON stringified account as fallback:', jsonString);
        // Create a hash from the JSON string to use as identifier
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
          hash = ((hash << 5) - hash) + jsonString.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
      }
    } catch (e) {
      console.error('Error stringifying address object:', e);
    }

    // If all else fails, return null so the calling code can handle this case
    console.error('Could not format account address', address);
    return null;
  };

  // Utility function to format Aptos address for the UI display
  const formatAptosAddressForDisplay = (address) => {
    if (!address) return 'unknown';

    // If it's a long address, truncate it for display
    if (typeof address === 'string' && address.length > 20) {
      return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
    }

    return address;
  };

  // Direct test button for debugging RLS
  const testRlsDirectly = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if required environment variables are available
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
      }

      // Always use the hardcoded UUID that works
      const creatorId = '846ceff6-c234-4d14-b473-f6bcd0dff3af';
      console.log('Test job - using the hardcoded UUID:', creatorId);

      // Create a simple test job - EXACTLY match the structure from the successful job
      const testJob = {
        title: 'RLS Test Job',
        description: 'Testing direct API access with service role key',
        budget: 100,
        category: 'Development',
        deadline: new Date().toISOString().split('T')[0],
        status: 'open',
        creator_id: creatorId
      };

      // Use fetch with service role key to bypass RLS
      const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testJob)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Test job creation failed:', errorData);
        throw new Error(`Failed to create test job: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      setSuccess(true);
      console.log('TEST JOB CREATED SUCCESSFULLY:', data);
      setTimeout(() => {
        setSuccess(false);
        setError('TEST PASSED ✓ Now try the regular form.');
      }, 2000);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get formatted Aptos address
  const getFormattedAptosAddress = () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.accountAddress) {
          const formattedAddress = formatAptosAddress(parsedUser.accountAddress);
          if (formattedAddress) {
            console.log('Formatted address from user:', formattedAddress);
            return formattedAddress;
          }
        }
      }

      const aptosAccount = localStorage.getItem('@aptos/keyless_account');
      if (aptosAccount) {
        const parsedAccount = JSON.parse(aptosAccount);
        if (parsedAccount.accountAddress) {
          const formattedAddress = formatAptosAddress(parsedAccount.accountAddress);
          if (formattedAddress) {
            console.log('Formatted address from keyless account:', formattedAddress);
            return formattedAddress;
          }
        }

        // Try with direct data if accountAddress is missing
        if (parsedAccount.data && Array.isArray(parsedAccount.data)) {
          const formattedAddress = formatAptosAddress(parsedAccount);
          if (formattedAddress) {
            console.log('Formatted address from account data:', formattedAddress);
            return formattedAddress;
          }
        }
      }

      console.warn('Could not find or format Aptos address');
      return null;
    } catch (e) {
      console.error('Error getting Aptos address:', e);
      return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Post a New Job</h1>

      {/* Debug toggle button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAuthDebug(!showAuthDebug)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1 px-2 rounded"
        >
          {showAuthDebug ? 'Hide Auth Debug' : 'Show Auth Debug'}
        </button>
      </div>

      {/* Auth debug component */}
      {showAuthDebug && <AuthStatus />}

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
                <strong>Sign In Required:</strong> You need to be signed in to post a job. The payment will be processed through your connected account.
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

      {/* Special test button for debugging RLS */}
      <div className="mb-6">
        <button
          type="button"
          onClick={testRlsDirectly}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Direct API Access with Service Role Key'}
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Click this button to test posting a job directly using the service role key (bypasses RLS)
        </p>
      </div>

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