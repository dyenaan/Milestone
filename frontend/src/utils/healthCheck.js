import api from '../services/api';
import { supabase } from '../services/supabase';

/**
 * Checks the health of the backend API
 * @returns {Promise<{success: boolean, message: string, statusCode: number}>}
 */
export const checkBackendHealth = async () => {
    try {
        const response = await api.get('/health');
        return {
            success: true,
            message: response.data.message || 'Backend is healthy',
            statusCode: response.status
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to connect to backend',
            statusCode: error.response?.status || 0
        };
    }
};

/**
 * Checks the health of the Supabase connection
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const checkSupabaseHealth = async () => {
    try {
        // Ping the Supabase health check endpoint
        const { error } = await supabase.from('health_check').select('*').limit(1);

        if (error) {
            throw new Error(error.message);
        }

        // Try to fetch the session to verify authentication works
        const { error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            throw new Error(sessionError.message);
        }

        return {
            success: true,
            message: 'Supabase connection is healthy'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to connect to Supabase'
        };
    }
};

/**
 * Runs all health checks
 * @returns {Promise<{backend: Object, supabase: Object}>}
 */
export const runAllHealthChecks = async () => {
    const backendHealth = await checkBackendHealth();
    const supabaseHealth = await checkSupabaseHealth();

    return {
        backend: backendHealth,
        supabase: supabaseHealth,
        allHealthy: backendHealth.success && supabaseHealth.success
    };
};

export const checkApiStatus = async () => {
    try {
        const response = await fetch('/api/health');
        if (!response.ok) {
            throw new Error('API health check failed');
        }
        return { status: 'ok', message: 'API is healthy' };
    } catch (error) {
        console.error('API health check failed:', error);
        return { status: 'error', message: 'API connection issue' };
    }
}; 