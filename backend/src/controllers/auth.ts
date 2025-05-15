import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`,
                }
            }
        });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(201).json({
            message: 'User registered successfully',
            user: data.user
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        return res.status(200).json({
            message: 'Login successful',
            session: data.session,
            user: data.user
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Login with Aptos wallet
 */
export const loginWithAptos = async (req: Request, res: Response) => {
    try {
        const { address, signature, message } = req.body;

        if (!address || !signature || !message) {
            return res.status(400).json({
                message: 'Address, signature, and message are required'
            });
        }

        // Verify signature - in a real implementation, you'd need to verify the signature
        // against the message using Aptos libraries

        // For now, we'll just create a new session
        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${address}@aptos.user`,
            password: 'password', // This is just a placeholder - in production, you'd use a different auth method
        });

        if (error) {
            return res.status(401).json({
                message: 'Authentication failed'
            });
        }

        return res.status(200).json({
            message: 'Login successful',
            session: data.session,
            user: data.user
        });
    } catch (error) {
        console.error('Aptos login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Login with Google and Aptos
 */
export const loginWithGoogleAptos = async (req: Request, res: Response) => {
    try {
        const { idToken, userInfo } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: 'ID token is required'
            });
        }

        // In a real implementation, you'd verify the ID token with Google
        // and create a Supabase session based on Google auth

        // For demo purposes, we'll create a user with the provided email
        const email = userInfo?.email || `google_${Date.now()}@example.com`;

        // Check if user exists or create new one
        const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
            email,
            password: 'google_oauth_user', // This is just a placeholder for demo
        });

        if (userError && userError.message.includes('Invalid login credentials')) {
            // User doesn't exist, create a new one
            const { data: newUserData, error: signUpError } = await supabase.auth.signUp({
                email,
                password: 'google_oauth_user', // This is just a placeholder for demo
                options: {
                    data: {
                        full_name: userInfo?.name || 'Google User',
                        oauth_provider: 'google',
                    }
                }
            });

            if (signUpError) {
                return res.status(400).json({
                    message: signUpError.message
                });
            }

            return res.status(200).json({
                message: 'Google login successful',
                session: newUserData.session,
                user: newUserData.user
            });
        } else if (userError) {
            return res.status(401).json({
                message: 'Authentication failed'
            });
        }

        return res.status(200).json({
            message: 'Google login successful',
            session: userData.session,
            user: userData.user
        });
    } catch (error) {
        console.error('Google Aptos login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Login with Apple and Aptos
 */
export const loginWithAppleAptos = async (req: Request, res: Response) => {
    try {
        const { idToken, userInfo } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: 'ID token is required'
            });
        }

        // In a real implementation, you'd verify the ID token with Apple
        // and create a Supabase session based on Apple auth

        // For demo purposes, we'll create a user with a generated email
        const email = userInfo?.email || `apple_${Date.now()}@example.com`;

        // Check if user exists or create new one
        const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
            email,
            password: 'apple_oauth_user', // This is just a placeholder for demo
        });

        if (userError && userError.message.includes('Invalid login credentials')) {
            // User doesn't exist, create a new one
            const { data: newUserData, error: signUpError } = await supabase.auth.signUp({
                email,
                password: 'apple_oauth_user', // This is just a placeholder for demo
                options: {
                    data: {
                        full_name: userInfo?.name || 'Apple User',
                        oauth_provider: 'apple',
                    }
                }
            });

            if (signUpError) {
                return res.status(400).json({
                    message: signUpError.message
                });
            }

            return res.status(200).json({
                message: 'Apple login successful',
                session: newUserData.session,
                user: newUserData.user
            });
        } else if (userError) {
            return res.status(401).json({
                message: 'Authentication failed'
            });
        }

        return res.status(200).json({
            message: 'Apple login successful',
            session: userData.session,
            user: userData.user
        });
    } catch (error) {
        console.error('Apple Aptos login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}; 