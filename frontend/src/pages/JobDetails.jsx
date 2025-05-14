import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - replace with actual data from your backend
  const job = {
    id: 1,
    title: 'Website Redesign',
    client: 'Acme Corp',
    budget: '$2,000',
    status: 'in-progress',
    description: 'Complete redesign of the company website with modern UI/UX principles.',
    milestones: [
      {
        id: 1,
        title: 'Initial Design Mockups',
        dueDate: '2024-03-15',
        status: 'completed',
        description: 'Create initial design mockups for homepage and key pages',
      },
      {
        id: 2,
        title: 'Frontend Development',
        dueDate: '2024-03-25',
        status: 'in-progress',
        description: 'Implement the frontend using React and Tailwind CSS',
      },
      {
        id: 3,
        title: 'Testing and Deployment',
        dueDate: '2024-04-01',
        status: 'pending',
        description: 'Perform testing and deploy to production',
      },
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'pending':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Add API call to update job
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <p className="mt-1 text-sm text-gray-500">Client: {job.client}</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit Job
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Job Details */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Job Details
            </h3>
            <div className="mt-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.status}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.budget}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {job.description}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Milestones
            </h3>
            <div className="mt-5">
              <ul className="divide-y divide-gray-200">
                {job.milestones.map((milestone) => (
                  <li key={milestone.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {milestone.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {milestone.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Due: {milestone.dueDate}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails; 