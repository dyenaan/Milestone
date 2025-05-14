import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, BriefcaseIcon, ClipboardDocumentListIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                FreelanceHub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <BriefcaseIcon className="h-5 w-5 mr-1" />
                Jobs
              </Link>
              <Link
                to="/milestones"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-1" />
                Milestones
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/create-job"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              Create Job
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 