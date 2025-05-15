import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// API URL from environment variable or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function MilestoneTracker() {
  const [filter, setFilter] = useState('all');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get wallet address from user
      const walletAddress = user?.accountAddress || user?.wallet_address;

      if (!walletAddress) {
        setError('No wallet address found. Please connect your wallet.');
        setLoading(false);
        return;
      }

      // Fetch milestones for this wallet
      const response = await axios.get(`${API_URL}/wallet/milestones/${walletAddress}`);

      // Ensure we're dealing with an array and not an object with {data} property
      if (response && response.data) {
        // Check if response.data is an object with a milestones property
        const milestonesData = response.data.milestones || response.data;

        // Validate that we have an array before setting state
        if (Array.isArray(milestonesData)) {
          setMilestones(milestonesData);
        } else {
          console.warn('Received non-array milestone data:', milestonesData);
          setMilestones([]);
        }
      } else {
        setMilestones([]);
      }
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError('Failed to load milestones. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMilestones = milestones.filter((milestone) => {
    if (filter === 'all') return true;
    return milestone.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'paid':
        return <BanknotesIcon className="h-5 w-5 text-green-400" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleProcessPayment = async (milestoneId) => {
    try {
      // For demo purposes - would integrate with actual payment processing
      alert(`Processing payment for milestone ${milestoneId}. In a real app, this would integrate with your blockchain payment system.`);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ArrowPathIcon className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'in_progress'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'paid'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Paid
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {filteredMilestones.length === 0 ? (
        <div className="bg-white shadow rounded-md p-6 text-center">
          <p className="text-gray-500">No milestones found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredMilestones.map((milestone) => (
              <li key={milestone.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(milestone.status)}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-primary-600">
                            <Link to={`/job/${milestone.job_id}`}>{milestone.job_title}</Link>: {milestone.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">${milestone.amount}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Due: {formatDate(milestone.deadline)}
                        </p>
                        {milestone.status === 'completed' && (
                          <button
                            onClick={() => handleProcessPayment(milestone.id)}
                            className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                          >
                            Process Payment
                          </button>
                        )}
                        {milestone.transaction_hash && (
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${milestone.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800"
                          >
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MilestoneTracker; 