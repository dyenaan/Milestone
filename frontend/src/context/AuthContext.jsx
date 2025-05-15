import React, { createContext, useState, useEffect, useContext } from 'react';
import { userApi, aptosApi } from '../services/api';
import { KeylessAccount } from '@aptos-labs/ts-sdk';
import { supabase, supabaseAuth } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keylessAccount, setKeylessAccount] = useState(null);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            // Check for Supabase session first
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: { user: supabaseUser } } = await supabase.auth.getUser();
                if (supabaseUser) {
                    setUser({
                        ...supabaseUser,
                        isSupabase: true
                    });
                    setLoading(false);
                    return;
                }
            }

            // Try to get keyless account
            const savedKeylessAccount = getLocalKeylessAccount();
            if (savedKeylessAccount) {
                setKeylessAccount(savedKeylessAccount);
                setUser({
                    accountAddress: savedKeylessAccount.accountAddress,
                    isKeyless: true,
                });
                setLoading(false);
                return;
            }

            if (token) {
                try {
                    if (savedUser) {
                        // If we have a saved user in localStorage, use it initially
                        setUser(JSON.parse(savedUser));
                    }

                    // Then fetch the latest user data from the server
                    const { data } = await userApi.getCurrentUser();
                    setUser(data);

                    // Update the stored user
                    localStorage.setItem('user', JSON.stringify(data));
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
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

            setUser({
                ...data.user,
                isSupabase: true
            });

            return data.user;
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

            setUser({
                ...data.user,
                isSupabase: true
            });

            return data.user;
        } catch (error) {
            setError(error.message || 'Supabase registration failed');
            throw error;
        }
    };

    const loginWithAptos = async (walletData) => {
        try {
            setError(null);
            const { data } = await aptosApi.loginWithAptos(walletData);
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
            const { data } = await aptosApi.loginWithGoogle(loginData);
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
            const { data } = await aptosApi.loginWithApple(loginData);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.response?.data?.message || 'Apple Aptos login failed');
            throw error;
        }
    };

    const storeKeylessAccount = (account) => {
        localStorage.setItem('@aptos/keyless_account', encodeKeylessAccount(account));
        setKeylessAccount(account);
        setUser({
            accountAddress: account.accountAddress,
            isKeyless: true,
        });
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
        // Sign out from Supabase if the user is authenticated with Supabase
        if (user?.isSupabase) {
            await supabaseAuth.signOut();
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('@aptos/keyless_account');
        setUser(null);
        setKeylessAccount(null);
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
                updateProfile,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 