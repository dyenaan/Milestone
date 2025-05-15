import React from 'react';
import HealthCheck from '../components/HealthCheck';

const SystemStatus = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">System Status</h1>
      
      <div className="mb-8">
        <HealthCheck />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4">Connection Details</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Backend API</h3>
            <p className="text-gray-600 text-sm mt-1">
              The backend API handles business logic, authentication, and database operations.
              It communicates with Supabase for data storage and user management.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Supabase Integration</h3>
            <p className="text-gray-600 text-sm mt-1">
              Supabase provides authentication, database, and storage services.
              The application can connect directly to Supabase or through the backend API.
            </p>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium">Tech Stack</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm mt-1 space-y-1">
              <li>Frontend: React, TailwindCSS</li>
              <li>Backend: Express.js, Node.js</li>
              <li>Database: PostgreSQL (via Supabase)</li>
              <li>Authentication: JWT, Supabase Auth</li>
              <li>Web3: Aptos integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus; 