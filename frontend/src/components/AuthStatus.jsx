import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthStatus = () => {
    const { user, loading, error, isAuthenticated, authSource } = useAuth();

    const getStoredData = () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        const aptosAccount = localStorage.getItem('@aptos/keyless_account');

        return {
            token: token ? 'exists' : 'none',
            savedUser: savedUser ? JSON.parse(savedUser) : null,
            aptosAccount: aptosAccount ? 'exists' : 'none'
        };
    };

    const storedData = getStoredData();

    return (
        <div className="mt-6 rounded-md bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Authentication Status</h3>

            <div className="space-y-2 text-xs text-gray-600">
                <div>
                    <span className="font-medium">Status:</span>
                    {loading ? (
                        <span className="text-amber-600 ml-1">Loading...</span>
                    ) : isAuthenticated ? (
                        <span className="text-green-600 ml-1">Authenticated</span>
                    ) : (
                        <span className="text-red-600 ml-1">Not Authenticated</span>
                    )}
                </div>

                {error && (
                    <div>
                        <span className="font-medium">Error:</span>
                        <span className="text-red-600 ml-1">{error}</span>
                    </div>
                )}

                <div>
                    <span className="font-medium">Auth Source:</span>
                    <span className="ml-1">{authSource || 'none'}</span>
                </div>

                <div>
                    <span className="font-medium">LocalStorage:</span>
                    <ul className="list-disc list-inside ml-2 mt-1">
                        <li>Token: {storedData.token}</li>
                        <li>User: {storedData.savedUser ? 'exists' : 'none'}</li>
                        <li>Aptos Account: {storedData.aptosAccount}</li>
                    </ul>
                </div>

                {user && (
                    <div>
                        <span className="font-medium">Current User:</span>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-2">
                    <button
                        onClick={() => {
                            // Test Supabase session
                            const testAuth = async () => {
                                try {
                                    const { data, error } = await fetch('https://okfjxtvdwdvflfjykpyi.supabase.co/rest/v1/jobs?select=id&limit=1', {
                                        headers: {
                                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk',
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        }
                                    }).then(r => r.json());
                                    alert(`Auth Test: ${error ? 'Failed' : 'Success'}\n${JSON.stringify(data || error)}`);
                                } catch (e) {
                                    alert(`Auth Test Error: ${e.message}`);
                                }
                            };
                            testAuth();
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-1 px-2 rounded"
                    >
                        Test Auth
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthStatus; 