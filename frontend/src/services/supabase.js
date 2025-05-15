import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okfjxtvdwdvflfjykpyi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const supabaseAuth = {
    // Sign up with email and password
    signUp: async (email, password, userData = {}) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        return supabase.auth.signInWithPassword({
            email,
            password
        });
    },

    // Sign out
    signOut: async () => {
        return supabase.auth.signOut();
    },

    // Get current session
    getSession: async () => {
        return supabase.auth.getSession();
    },

    // Get current user
    getUser: async () => {
        const { data } = await supabase.auth.getUser();
        return data?.user;
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

        return query.order('created_at', { ascending: false });
    },

    // Get job by id
    getJobById: async (id) => {
        return supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();
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

        return supabase
            .from('jobs')
            .insert(processedData);
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
        return supabase
            .from('milestones')
            .insert(milestoneData);
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