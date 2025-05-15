import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okfjxtvdwdvflfjykpyi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const supabaseAuth = {
    // Sign up with email and password
    signUp: async (email, password, userData = {}) => {
        const response = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        // Return the response with properly extracted data to prevent direct rendering of objects
        return {
            data: response.data,
            error: response.error
        };
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        const response = await supabase.auth.signInWithPassword({
            email,
            password
        });
        // Return the response with properly extracted data to prevent direct rendering of objects
        return {
            data: response.data,
            error: response.error
        };
    },

    // Sign out
    signOut: async () => {
        const response = await supabase.auth.signOut();
        return {
            data: response.data,
            error: response.error
        };
    },

    // Get current session
    getSession: async () => {
        const response = await supabase.auth.getSession();
        return {
            data: response.data,
            error: response.error
        };
    },

    // Get current user
    getUser: async () => {
        const response = await supabase.auth.getUser();
        return response.data?.user || null;
    }
};

// Helper functions for profiles
export const supabaseProfiles = {
    // Get user profile by id
    getProfile: async (id) => {
        return supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
    },

    // Update user profile
    updateProfile: async (id, updates) => {
        return supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);
    }
};

// Helper functions for jobs
export const supabaseJobs = {
    // Get all jobs
    getJobs: async (filters = {}) => {
        let query = supabase.from('jobs').select('*');

        // Apply filters if any
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        const response = await query.order('created_at', { ascending: false });

        return {
            data: response.data || [],
            error: response.error
        };
    },

    // Get job by id
    getJobById: async (id) => {
        const response = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        return {
            data: response.data || null,
            error: response.error
        };
    },

    // Create new job
    createJob: async (jobData) => {
        // Prepare data for submission
        let processedData = { ...jobData };

        // Validate creator_id - can be wallet address or UUID
        if (!processedData.creator_id ||
            typeof processedData.creator_id !== 'string' ||
            processedData.creator_id.includes('{') ||
            processedData.creator_id.includes('[')) {

            console.warn('Invalid creator_id format detected:', processedData.creator_id);

            // Use a default wallet-like address as fallback
            processedData.creator_id = '0x123456789abcdef123456789abcdef123456789abcdef';
        }

        // If the ID looks like a UUID but we're expecting a wallet address now
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processedData.creator_id)) {
            console.log('Converting UUID to wallet-like format for consistency');
            // Convert UUID to wallet-like format (for display consistency)
            // This preserves the ID value while making it look like a wallet address
            processedData.creator_id = '0x' + processedData.creator_id.replace(/-/g, '');
        }

        console.log('Creating job with creator:', processedData.creator_id);

        const response = await supabase
            .from('jobs')
            .insert(processedData)
            .select();

        return {
            data: response.data?.[0] || null,
            error: response.error
        };
    },

    // Update job
    updateJob: async (id, updates) => {
        return supabase
            .from('jobs')
            .update(updates)
            .eq('id', id);
    },

    // Delete job
    deleteJob: async (id) => {
        return supabase
            .from('jobs')
            .delete()
            .eq('id', id);
    }
};

// Helper functions for milestones
export const supabaseMilestones = {
    // Get milestones by job id
    getMilestonesByJobId: async (jobId) => {
        return supabase
            .from('milestones')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });
    },

    // Get milestone by id
    getMilestoneById: async (id) => {
        return supabase
            .from('milestones')
            .select('*')
            .eq('id', id)
            .single();
    },

    // Create new milestone
    createMilestone: async (milestoneData) => {
        const response = await supabase
            .from('milestones')
            .insert(milestoneData)
            .select();

        return {
            data: response.data?.[0] || null,
            error: response.error
        };
    },

    // Update milestone
    updateMilestone: async (id, updates) => {
        return supabase
            .from('milestones')
            .update(updates)
            .eq('id', id);
    },

    // Delete milestone
    deleteMilestone: async (id) => {
        return supabase
            .from('milestones')
            .delete()
            .eq('id', id);
    }
}; 