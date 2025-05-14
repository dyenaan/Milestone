import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

function MilestoneTracker() {
  const [filter, setFilter] = useState('all');

  // Mock data - replace with actual data from your backend
  const milestones = [
    {
      id: 1,
      title: 'Website Redesign - Milestone 1',
      job: 'Website Redesign',
      dueDate: '2024-03-15',
      status: 'completed',
      description: 'Initial design mockups and wireframes',
    },
    {
      id: 2,
      title: 'Mobile App - API Integration',
      job: 'Mobile App Development',
      dueDate: '2024-03-20',
      status: 'in-progress',
      description: 'Integrate backend APIs with mobile app',
    },
    {
      id: 3,
      title: 'UI/UX - User Testing',
      job: 'UI/UX Design',
      dueDate: '2024-03-10',
      status: 'overdue',
      description: 'Conduct user testing sessions and gather feedback',
    },
  ];

  const filteredMilestones = milestones.filter((milestone) => {
    if (filter === 'all') return true;
    return milestone.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'overdue':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'in-progress'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'overdue'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Milestones List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredMilestones.map((milestone) => (
            <li key={milestone.id}>
              <Link to={`/milestones/${milestone.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-primary-600">
                          {milestone.title}
                        </p>
                        <p className="text-sm text-gray-500">{milestone.job}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Due: {milestone.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{milestone.description}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MilestoneTracker; 