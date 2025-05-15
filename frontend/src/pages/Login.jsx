import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AptosLogin from '../components/AptosLogin';
import AuthStatus from '../components/AuthStatus';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const { loginWithSupabase, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we need to redirect after successful authentication
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('User is already authenticated:', user);
            const returnUrl = location.state?.returnUrl || '/';

            // If the user just logged in successfully, show a brief success message
            if (loginSuccess) {
                setTimeout(() => {
                    console.log('Redirecting to', returnUrl);
                    navigate(returnUrl);
                }, 1000);
            } else {
                // If they're already logged in, redirect immediately
                console.log('Already logged in, redirecting to', returnUrl);
                navigate(returnUrl);
            }
        }
    }, [isAuthenticated, user, navigate, location, loginSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const loginResult = await loginWithSupabase(email, password);
            console.log('Login successful:', loginResult);
            setLoginSuccess(true);

            // Don't navigate here - let the useEffect handle it for reliability
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
            setIsLoading(false);
        }
    };

    if (loginSuccess) {
        return (
            <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Login successful! Redirecting...
                                    </p>
                                </div>
                            </div>
                        </div>
                        {showDebug && <AuthStatus />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in with email or securely with your Google account and Aptos wallet
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <AptosLogin />
                        </div>
                    </div>

                    {/* Debug toggle button */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                        </button>
                    </div>

                    {/* Debug authentication status */}
                    {showDebug && <AuthStatus />}
                </div>
            </div>
        </div>
    );
};

export default Login; 