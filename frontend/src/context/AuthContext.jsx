import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { userApi, aptosApi } from '../services/api';
import { KeylessAccount } from '@aptos-labs/ts-sdk';
import { supabase, supabaseAuth } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keylessAccount, setKeylessAccount] = useState(null);
    const [isAptosAuthenticated, setIsAptosAuthenticated] = useState(false);
    const [authSource, setAuthSource] = useState(null); // Track auth source for debugging

    // Define getLocalKeylessAccount outside of the useEffect
    const getLocalKeylessAccount = () => {
        try {
            const encodedAccount = localStorage.getItem('@aptos/keyless_account');
            return encodedAccount ? decodeKeylessAccount(encodedAccount) : null;
        } catch (error) {
            console.warn('Failed to decode keyless account from localStorage', error);
            return null;
        }
    };

    const decodeKeylessAccount = (encodedAccount) => {
        return JSON.parse(encodedAccount, (_, e) => {
            if (e && e.__type === "bigint") return window.BigInt(e.value);
            if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
            if (e && e.__type === "KeylessAccount")
                return KeylessAccount.fromBytes(new Uint8Array(e.data));
            return e;
        });
    };

    useEffect(() => {
        // Check if user is already logged in
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            const aptosAccount = localStorage.getItem('@aptos/keyless_account');

            console.log('Checking auth status...');
            console.log('Saved token:', token ? 'exists' : 'none');
            console.log('Saved user:', savedUser);
            console.log('Aptos account:', aptosAccount ? 'exists' : 'none');

            // Check for Supabase session first
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                console.log('Supabase session check:', sessionData?.session ? 'active' : 'none');

                if (sessionError) {
                    console.error('Error getting session:', sessionError);
                } else if (sessionData?.session) {
                    const { data: userData, error: userError } = await supabase.auth.getUser();

                    if (userError) {
                        console.error('Error getting user data:', userError);
                    } else if (userData?.user) {
                        const supabaseUser = userData.user;

                        // Extract only the properties we need to avoid rendering objects directly
                        const safeUser = {
                            id: supabaseUser.id,
                            email: supabaseUser.email,
                            user_metadata: supabaseUser.user_metadata,
                            created_at: supabaseUser.created_at,
                            isSupabase: true,
                            authSource: 'supabase'
                        };

                        console.log('Setting authenticated Supabase user:', safeUser);
                        setUser(safeUser);
                        setAuthSource('supabase');
                        // Also save to localStorage for persistence
                        localStorage.setItem('user', JSON.stringify(safeUser));
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error('Error checking Supabase session:', err);
            }

            // Set Aptos authentication flag if any of these exist
            if (token || savedUser || aptosAccount) {
                console.log('Aptos authentication detected');
                setIsAptosAuthenticated(true);
            }

            // Try to get keyless account
            const savedKeylessAccount = getLocalKeylessAccount();
            if (savedKeylessAccount) {
                console.log('Found keyless account:', savedKeylessAccount);
                setKeylessAccount(savedKeylessAccount);
                const keylessUser = {
                    id: savedKeylessAccount.accountAddress, // Use address as ID
                    accountAddress: savedKeylessAccount.accountAddress,
                    isKeyless: true,
                    authSource: 'aptos_keyless'
                };
                console.log('Setting keyless user:', keylessUser);
                setUser(keylessUser);
                setAuthSource('aptos_keyless');
                // Also save to localStorage for persistence
                localStorage.setItem('user', JSON.stringify(keylessUser));
                setLoading(false);
                return;
            }

            if (token) {
                try {
                    if (savedUser) {
                        // If we have a saved user in localStorage, use it initially
                        const parsedUser = JSON.parse(savedUser);
                        setUser({
                            ...parsedUser,
                            authSource: 'api'
                        });
                        setAuthSource('api');
                    }

                    // Then fetch the latest user data from the server
                    try {
                        const { data } = await userApi.getCurrentUser();
                        const updatedUser = {
                            ...data,
                            authSource: 'api'
                        };
                        setUser(updatedUser);
                        setAuthSource('api');
                        // Update the stored user
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    } catch (apiError) {
                        console.error('API auth check failed:', apiError);

                        // If API call fails but we still have a saved user, keep using it
                        if (!savedUser) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setUser(null);
                            setAuthSource(null);
                        }
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setAuthSource(null);
                }
            }

            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const { data } = await userApi.login(credentials);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const loginWithSupabase = async (email, password) => {
        try {
            setError(null);
            const { data, error: supabaseError } = await supabaseAuth.signIn(email, password);

            if (supabaseError) {
                setError(supabaseError.message);
                throw supabaseError;
            }

            // Get the user data specifically from getUser to ensure correct ID
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError) {
                setError(userError.message);
                throw userError;
            }

            const supabaseUser = userData?.user;

            if (!supabaseUser) {
                throw new Error('Failed to retrieve user data from Supabase auth response');
            }

            // Save Supabase session token as 'token' for consistency
            if (data?.session?.access_token) {
                localStorage.setItem('token', data.session.access_token);
            }

            // Extract only the properties we need to avoid rendering objects directly
            const safeUser = {
                id: supabaseUser.id, // This ID will match auth.uid() in Supabase RLS
                email: supabaseUser.email,
                user_metadata: supabaseUser.user_metadata,
                created_at: supabaseUser.created_at,
                isSupabase: true,
                authSource: 'supabase'
            };

            setUser(safeUser);
            setAuthSource('supabase');
            localStorage.setItem('user', JSON.stringify(safeUser));
            return safeUser;
        } catch (error) {
            setError(error.message || 'Supabase login failed');
            throw error;
        }
    };

    const registerWithSupabase = async ({ email, password, firstName, lastName }) => {
        try {
            setError(null);
            const { data, error: supabaseError } = await supabaseAuth.signUp(email, password, {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
            });

            if (supabaseError) {
                setError(supabaseError.message);
                throw supabaseError;
            }

            // Get the user data specifically from getUser to ensure correct ID
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError) {
                setError(userError.message);
                throw userError;
            }

            const supabaseUser = userData?.user;

            if (!supabaseUser) {
                throw new Error('Failed to retrieve user data from Supabase auth response');
            }

            // Save Supabase session token as 'token' for consistency
            if (data?.session?.access_token) {
                localStorage.setItem('token', data.session.access_token);
            }

            // Extract only the properties we need to avoid rendering objects directly
            const safeUser = {
                id: supabaseUser.id, // This ID will match auth.uid() in Supabase RLS
                email: supabaseUser.email,
                user_metadata: supabaseUser.user_metadata,
                created_at: supabaseUser.created_at,
                isSupabase: true,
                authSource: 'supabase'
            };

            setUser(safeUser);
            setAuthSource('supabase');
            localStorage.setItem('user', JSON.stringify(safeUser));
            return safeUser;
        } catch (error) {
            setError(error.message || 'Supabase registration failed');
            throw error;
        }
    };

    const loginWithAptos = async (walletData) => {
        try {
            setError(null);
            const response = await aptosApi.loginWithAptos(walletData);
            const data = response.data;

            if (!data || !data.user) {
                throw new Error('Invalid response from Aptos login');
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.response?.data?.message || 'Aptos login failed');
            throw error;
        }
    };

    const loginWithGoogleAptos = async (loginData) => {
        try {
            setError(null);
            const response = await aptosApi.loginWithGoogle(loginData);
            const data = response.data;

            if (!data || !data.user) {
                throw new Error('Invalid response from Google Aptos login');
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.response?.data?.message || 'Google Aptos login failed');
            throw error;
        }
    };

    const loginWithAppleAptos = async (loginData) => {
        try {
            setError(null);
            const response = await aptosApi.loginWithApple(loginData);
            const data = response.data;

            if (!data || !data.user) {
                throw new Error('Invalid response from Apple Aptos login');
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.response?.data?.message || 'Apple Aptos login failed');
            throw error;
        }
    };

    // Utility function to format account address correctly
    const formatAptosAddress = (address) => {
        if (typeof address === 'string') {
            return address.startsWith('0x') ? address : `0x${address}`;
        }

        if (address && typeof address === 'object') {
            if (address.data && Array.isArray(address.data)) {
                // Create hex string from data array
                return '0x' + Array.from(address.data)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            }

            if (address.toString && typeof address.toString === 'function') {
                const strValue = address.toString();
                return strValue.startsWith('0x') ? strValue : `0x${strValue}`;
            }
        }

        // Fallback
        return `0x${address}`;
    };

    const storeKeylessAccount = (account) => {
        // Check if we have a valid account object
        if (!account || !account.accountAddress) {
            console.error('Invalid keyless account object:', account);
            setError('Invalid account data received. Please try again.');
            return;
        }

        localStorage.setItem('@aptos/keyless_account', encodeKeylessAccount(account));
        setKeylessAccount(account);

        // Format the account address correctly
        const accountAddress = formatAptosAddress(account.accountAddress);

        // Verify we have a valid address
        if (!accountAddress) {
            console.error('Failed to format account address:', account.accountAddress);
            setError('Could not process wallet address. Please try reconnecting.');
            return;
        }

        const keylessUser = {
            id: accountAddress, // Use the account address as ID
            accountAddress: accountAddress, // Store formatted address
            isKeyless: true,
            authSource: 'aptos_keyless'
        };
        console.log('Storing keyless user:', keylessUser);
        setUser(keylessUser);
        // Also save to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(keylessUser));
    };

    const encodeKeylessAccount = (account) => {
        return JSON.stringify(account, (_, e) => {
            if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
            if (e instanceof Uint8Array)
                return { __type: "Uint8Array", value: Array.from(e) };
            if (e instanceof KeylessAccount)
                return { __type: "KeylessAccount", data: Array.from(account.bcsToBytes()) };
            return e;
        });
    };

    const register = async (userData) => {
        try {
            setError(null);
            const { data } = await userApi.register(userData);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Sign out from Supabase if the user is authenticated with Supabase
            if (user?.isSupabase || authSource === 'supabase') {
                await supabaseAuth.signOut();
            }

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('@aptos/keyless_account');
            setUser(null);
            setKeylessAccount(null);
            setIsAptosAuthenticated(false);
            setAuthSource(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateProfile = async (userData) => {
        try {
            if (user?.isSupabase) {
                // Use Supabase to update profile
                const { data, error } = await supabase
                    .from('profiles')
                    .update(userData)
                    .eq('id', user.id)
                    .select()
                    .single();

                if (error) throw error;

                const updatedUser = { ...user, ...data };
                setUser(updatedUser);
                return updatedUser;
            } else {
                // Use traditional API
                const { data } = await userApi.updateProfile(userData);
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                return data;
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Profile update failed');
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                keylessAccount,
                authSource,
                isAptosAuthenticated,
                isAuthenticated: !!user || isAptosAuthenticated,
                login,
                loginWithSupabase,
                registerWithSupabase,
                loginWithAptos,
                loginWithGoogleAptos,
                loginWithAppleAptos,
                storeKeylessAccount,
                getLocalKeylessAccount,
                register,
                logout,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Add PropTypes validation
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 