import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get the token from the authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        // Add the user data to the request
        req.user = data.user;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}; 