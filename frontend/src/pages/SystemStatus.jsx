import React from 'react';
import HealthCheck from '../components/HealthCheck';

const SystemStatus = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold mb-8 text-center">System Status</h1>

            <div className="mb-8">
                <HealthCheck />
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 max-w-lg mx-auto">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong>Important:</strong> If you're seeing database relationship errors, ensure you've created the necessary Supabase tables as specified in the SUPABASE-README.md file.
                        </p>
                    </div>
                </div>
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