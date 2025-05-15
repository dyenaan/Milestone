import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables or use defaults for development
const supabaseUrl = process.env.SUPABASE_URL || 'https://okfjxtvdwdvflfjykpyi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODk5NiwiZXhwIjoyMDYyODk0OTk2fQ.628OGLFHx2UacTTIWNCOy7EIJDhKT7KXsXeR9sSPGgk';

// Create clients with different auth levels
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Test the connection to Supabase
export const testConnection = async () => {
    try {
        // Try to get health check data to verify connection
        const { data, error } = await supabase
            .from('health_check')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }

        if (!data || data.length === 0) {
            // If health_check table is empty, try to create a record using service role
            const { error: insertError } = await serviceSupabase
                .from('health_check')
                .insert({ status: 'ok', message: 'Supabase connection established' });

            if (insertError) {
                console.error('Failed to create health check record:', insertError);
                return false;
            }
        }

        console.log('Supabase connection successful');
        return true;
    } catch (err) {
        console.error('Supabase connection test failed:', err);
        return false;
    }
};

// Initialize Supabase connection on startup
(async () => {
    try {
        const connected = await testConnection();
        if (!connected) {
            console.warn('⚠️ Supabase connection issues detected - app will use mock data');
        } else {
            console.log('✅ Supabase connected successfully - app will use real data');
        }
    } catch (error) {
        console.error('Error testing Supabase connection:', error);
    }
})();

export default supabase; 