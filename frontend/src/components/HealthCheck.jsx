import React, { useState, useEffect } from 'react';
import { runAllHealthChecks } from '../utils/healthCheck';

const HealthCheck = () => {
    const [healthStatus, setHealthStatus] = useState({
        loading: true,
        backend: { success: false, message: 'Not checked yet' },
        supabase: { success: false, message: 'Not checked yet' },
        allHealthy: false
    });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const results = await runAllHealthChecks();
                setHealthStatus({
                    loading: false,
                    ...results
                });
            } catch (error) {
                setHealthStatus({
                    loading: false,
                    backend: { success: false, message: 'Error checking backend' },
                    supabase: { success: false, message: 'Error checking Supabase' },
                    allHealthy: false
                });
            }
        };

        checkHealth();
    }, []);

    const handleRetryCheck = async () => {
        setHealthStatus(prev => ({ ...prev, loading: true }));
        try {
            const results = await runAllHealthChecks();
            setHealthStatus({
                loading: false,
                ...results
            });
        } catch (error) {
            setHealthStatus({
                loading: false,
                backend: { success: false, message: 'Error checking backend' },
                supabase: { success: false, message: 'Error checking Supabase' },
                allHealthy: false
            });
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Backend API:</span>
                        <span className={`px-2 py-1 rounded text-sm ${healthStatus.backend.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {healthStatus.backend.success ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{healthStatus.backend.message}</p>
                </div>

                <div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Supabase:</span>
                        <span className={`px-2 py-1 rounded text-sm ${healthStatus.supabase.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {healthStatus.supabase.success ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{healthStatus.supabase.message}</p>
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Overall Status:</span>
                        <span className={`px-2 py-1 rounded text-sm ${healthStatus.allHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {healthStatus.allHealthy ? 'All Systems Operational' : 'Connection Issues Detected'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleRetryCheck}
                    disabled={healthStatus.loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {healthStatus.loading ? 'Checking...' : 'Retry Connection Check'}
                </button>
            </div>
        </div>
    );
};

export default HealthCheck; 