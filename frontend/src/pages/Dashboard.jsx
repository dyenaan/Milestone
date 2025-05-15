import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseJobs, supabaseApplications } from '../services/supabase';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      if (user) {
        // Determine all possible identifiers for this user
        const userIdentifiers = [];

        // Add user ID in UUID format if available
        if (user.id) {
          userIdentifiers.push(user.id);
        }

        // Add wallet address if available
        if (user.walletAddress || user.accountAddress) {
          userIdentifiers.push(user.walletAddress || user.accountAddress);
        }

        // Add wallet-like format of the UUID
        if (user.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
          userIdentifiers.push('0x' + user.id.replace(/-/g, ''));
        }

        console.log('Searching for jobs with user identifiers:', userIdentifiers);

        // Fetch jobs for all possible identifiers
        let allPostedJobs = [];
        for (const identifier of userIdentifiers) {
          const { data: jobs } = await supabaseJobs.getJobs({ creator_id: identifier });
          if (jobs && jobs.length > 0) {
            allPostedJobs = [...allPostedJobs, ...jobs];
          }
        }

        // Remove duplicates by job ID
        const uniqueJobs = Array.from(
          new Map(allPostedJobs.map(job => [job.id, job])).values()
        );

        setPostedJobs(uniqueJobs);

        // Fetch jobs applied to by the user (all possible identifiers)
        let allApplications = [];
        for (const identifier of userIdentifiers) {
          const { data: applications } = await supabaseApplications.getApplicationsByUserId(identifier);
          if (applications && applications.length > 0) {
            allApplications = [...allApplications, ...applications];
          }
        }

        // Remove duplicates by application ID
        const uniqueApplications = Array.from(
          new Map(allApplications.map(app => [app.id, app])).values()
        );

        setAppliedJobs(uniqueApplications);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [user]);

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

      {/* User Information Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Welcome back, {user?.username || 'User'}!
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{user?.role}</dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Reputation</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.reputation || 0}</dd>
            </div>

            {user?.walletAddress && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 truncate">
                  {user.walletAddress}
                </dd>
              </div>
            )}
          </dl>
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
                <li key={job.id}>
                  <Link to={`/job/${job.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{job.title}</p>
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
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Jobs Applied To */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Applications</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Jobs you&apos;ve applied to
          </p>
        </div>
        <div className="border-t border-gray-200">
          {appliedJobs.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              You haven&apos;t applied to any jobs yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {appliedJobs.map(application => (
                <li key={application.id}>
                  <Link to={`/job/${application.job_id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {application.jobs.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'}`}>
                            {application.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Your price: ${application.price}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Estimated time: {application.estimated_time}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Applied on {new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 