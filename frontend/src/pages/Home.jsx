import React from 'react';
import { useAuth } from '../context/AuthContext';
import TestKeyless from '../components/TestKeyless';

function Home() {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">MQ3K Platform</h1>

                {isAuthenticated ? (
                    <div>
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
                            <p className="mb-2">
                                You are logged in as: <span className="font-semibold">{user?.accountAddress || user?.email}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                {user?.isKeyless
                                    ? "You're using a keyless Aptos account"
                                    : "You're using a standard account"}
                            </p>
                        </div>

                        {/* Add the TestKeyless component */}
                        <TestKeyless />
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Welcome to MQ3K Platform</h2>
                        <p className="mb-4">
                            Please log in to access the full features of the platform.
                        </p>
                        <a
                            href="/login"
                            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Login / Sign Up
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home; 