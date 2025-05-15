import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const NetworkErrorHandler = () => {
    const [supabaseStatus, setSupabaseStatus] = useState('checking');
    const [showNotice, setShowNotice] = useState(true);

    useEffect(() => {
        // Check Supabase connection
        const checkSupabaseConnection = async () => {
            try {
                // Perform a simple query to verify connection
                const { error } = await supabase
                    .from('health_check')
                    .select('*')
                    .limit(1);

                if (error) {
                    console.error('Supabase connection check failed:', error);
                    // For specific errors, provide more detailed status
                    if (error.code === 'PGRST116') {
                        setSupabaseStatus('table-missing');
                    } else if (error.code?.startsWith('42')) {
                        setSupabaseStatus('permission-denied');
                    } else {
                        setSupabaseStatus('error');
                    }
                } else {
                    setSupabaseStatus('connected');
                }
            } catch (err) {
                console.error('Error checking Supabase connection:', err);
                setSupabaseStatus('error');
            }
        };

        checkSupabaseConnection();

        // Set up interval to periodically check connection
        const intervalId = setInterval(checkSupabaseConnection, 30000); // Check every 30 seconds

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    const handleRetry = () => {
        setSupabaseStatus('checking');
        window.location.reload();
    };

    const handleDismiss = () => {
        setShowNotice(false);
    };

    if (!showNotice || supabaseStatus === 'connected') {
        return null; // Don't render anything if all is well or dismissed
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 text-white p-3 z-50 shadow-lg">
            <div className={`flex items-center justify-between rounded-lg p-3 ${supabaseStatus === 'error' ? 'bg-orange-600' :
                    supabaseStatus === 'table-missing' ? 'bg-yellow-600' :
                        supabaseStatus === 'permission-denied' ? 'bg-blue-600' :
                            'bg-gray-600'
                }`}>
                <div className="flex-1">
                    {supabaseStatus === 'error' ? (
                        <p>Database connection failed. Please try again later.</p>
                    ) : supabaseStatus === 'table-missing' ? (
                        <p>Database tables are not set up. Some features may not work properly.</p>
                    ) : supabaseStatus === 'permission-denied' ? (
                        <p>Authentication needed for full access. Limited features available in demo mode.</p>
                    ) : (
                        <p>Checking connection status...</p>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRetry}
                        className="px-3 py-1 bg-white text-gray-800 rounded text-sm font-medium"
                    >
                        Retry
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-1 bg-transparent border border-white text-white rounded text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NetworkErrorHandler; 