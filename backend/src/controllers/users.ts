import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get user profile
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        // The user is already available from the auth middleware
        const { user } = req;

        // Query Supabase for additional user data if needed
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        // Return combined user data
        return res.status(200).json({
            user: {
                ...user,
                profile: data || {}
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { firstName, lastName, bio, skills } = req.body;

        // Update user metadata in auth
        const authUpdate = {};
        if (firstName || lastName) {
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName || user.user_metadata?.first_name,
                    last_name: lastName || user.user_metadata?.last_name,
                    full_name: `${firstName || user.user_metadata?.first_name} ${lastName || user.user_metadata?.last_name}`,
                }
            });

            if (error) {
                return res.status(400).json({
                    message: error.message
                });
            }
        }

        // Update profile data in profiles table
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                bio: bio,
                skills: skills,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            profile: data
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}; 