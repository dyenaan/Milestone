import React from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

function Dashboard() {
  // Mock data - replace with actual data from your backend
  const stats = [
    { name: 'Active Jobs', value: '3', icon: ClockIcon, color: 'bg-blue-500' },
    { name: 'Completed Milestones', value: '12', icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Total Earnings', value: '$2,500', icon: CurrencyDollarIcon, color: 'bg-yellow-500' },
    { name: 'Pending Reviews', value: '2', icon: DocumentTextIcon, color: 'bg-purple-500' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'milestone',
      title: 'Website Redesign - Milestone 1',
      status: 'completed',
      date: '2 hours ago',
    },
    {
      id: 2,
      type: 'job',
      title: 'Mobile App Development',
      status: 'in-progress',
      date: '1 day ago',
    },
    {
      id: 3,
      type: 'review',
      title: 'UI/UX Design Review',
      status: 'pending',
      date: '2 days ago',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {activity.title}
                    </p>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link
              to="/jobs"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              View all activity
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 