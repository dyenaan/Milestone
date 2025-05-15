import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../services/api';
import { supabaseJobs } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const Marketplace = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        category: '',
        minBudget: '',
        maxBudget: '',
        status: 'open'
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        try {
            let jobData = [];

            // Try to get jobs from API first
            try {
                const response = await jobsApi.getJobs(filter);
                jobData = response.data || [];
                console.log('Jobs from API:', jobData);
            } catch (apiError) {
                console.warn('API fetch failed, trying Supabase directly', apiError);

                // If API fails, try Supabase as fallback
                const { data, error } = await supabaseJobs.getJobs(filter);
                if (error) throw error;
                jobData = data || [];
                console.log('Jobs from Supabase:', jobData);
            }

            setJobs(jobData);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs. Please try again later.');

            // Set empty jobs array as fallback
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    // For demo purposes, let's add some mock jobs if there are none
    const mockJobs = [
        {
            id: 'mock-1',
            title: 'Frontend Developer Needed',
            description: 'Looking for a skilled frontend developer to build a responsive web application',
            budget: 2000,
            category: 'Development',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
            status: 'open',
            creator: {
                id: 'mock-user-1',
                name: 'John Smith'
            }
        },
        {
            id: 'mock-2',
            title: 'Logo Design for Startup',
            description: 'Need a professional logo for a new tech startup in the AI space',
            budget: 500,
            category: 'Design',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
            status: 'open',
            creator: {
                id: 'mock-user-2',
                name: 'Alice Johnson'
            }
        },
        {
            id: 'mock-3',
            title: 'Smart Contract Development',
            description: 'Develop a smart contract for an NFT marketplace on Aptos',
            budget: 3000,
            category: 'Blockchain',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
            status: 'open',
            creator: {
                id: 'mock-user-3',
                name: 'Robert Chen'
            }
        }
    ];

    const displayedJobs = jobs.length > 0 ? jobs : mockJobs;

    const categories = ['All', 'Development', 'Design', 'Marketing', 'Blockchain', 'Content', 'Other'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Marketplace</h1>
                <Link
                    to="/create-job"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Post a Job
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h2 className="text-lg font-medium mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={filter.category}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category === 'All' ? '' : category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700">Min Budget</label>
                        <input
                            type="number"
                            id="minBudget"
                            name="minBudget"
                            value={filter.minBudget}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Min Budget"
                        />
                    </div>

                    <div>
                        <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700">Max Budget</label>
                        <input
                            type="number"
                            id="maxBudget"
                            name="maxBudget"
                            value={filter.maxBudget}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Max Budget"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={filter.status}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error and Loading states */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <>
                    {/* Job listings */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {displayedJobs.map((job) => (
                            <div key={job.id} className="bg-white shadow overflow-hidden rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{job.title}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {job.status}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 line-clamp-3">{job.description}</p>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">${job.budget}</span>
                                            <span className="text-sm text-gray-500 ml-1">Budget</span>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {job.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500">
                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="mt-5">
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {displayedJobs.length === 0 && (
                        <div className="bg-white shadow rounded-lg p-8 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-500">Try adjusting your filters or check back later for new opportunities.</p>
                        </div>
                    )}

                    {jobs.length === 0 && mockJobs.length > 0 && (
                        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Note:</strong> Currently showing mock data. Connect your Supabase database to see real job listings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Marketplace; 