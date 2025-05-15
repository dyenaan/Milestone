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
        try {
            const response = await supabase.auth.getSession();
            return {
                data: response.data,
                error: response.error
            };
        } catch (err) {
            console.error('Error getting session:', err);
            return {
                data: null,
                error: {
                    message: 'Unable to connect to authentication service. Please check your internet connection and try again.'
                }
            };
        }
    },

    // Get current user
    getUser: async () => {
        try {
            const response = await supabase.auth.getUser();
            return response.data?.user || null;
        } catch (err) {
            console.error('Error getting user data:', err);
            return null;
        }
    }
};

// Helper functions for job applications
export const supabaseApplications = {
    // Get applications by user ID
    getApplicationsByUserId: async (userId) => {
        if (!userId) {
            console.warn('No user ID provided for application lookup');
            return { data: [], error: null };
        }

        // Fixed UUID for Aptos wallet users (fallback)
        const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

        // Format check - extract string format if it's an object
        let formattedUserId = userId;

        // Handle Aptos wallet address objects
        if (typeof userId === 'object') {
            // If it's an object with a uuid property (from AuthContext), use that
            if (userId.uuid) {
                console.log('Using provided UUID from user object:', userId.uuid);
                formattedUserId = userId.uuid;
            } else if (userId.data instanceof Uint8Array) {
                console.log('Using fixed UUID for Aptos user in application lookup');
                formattedUserId = APTOS_USER_UUID;
            }
        }

        // Format check - if UUID convert to both formats for query
        let userIdFormats = [formattedUserId];

        // Always include the Aptos UUID for wallet address objects
        if (!userIdFormats.includes(APTOS_USER_UUID) &&
            (typeof userId === 'object' || (typeof userId === 'string' && userId.startsWith('0x')))) {
            userIdFormats.push(APTOS_USER_UUID);
        }

        // If it's a UUID, add the wallet-like format
        if (typeof formattedUserId === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formattedUserId)) {
            userIdFormats.push('0x' + formattedUserId.replace(/-/g, ''));
        }

        // If it's already a wallet-like format (starting with 0x), we're good
        console.log('Searching for applications with user ID formats:', userIdFormats);

        // Use OR filter to check all possible formats
        const response = await supabase
            .from('job_applications')
            .select('*, jobs(*)')
            .in('applicant_id', userIdFormats)
            .order('created_at', { ascending: false });

        return {
            data: response.data || [],
            error: response.error
        };
    },

    // Get applications by job ID
    getApplicationsByJobId: async (jobId) => {
        const response = await supabase
            .from('job_applications')
            .select('*, profiles(*)')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        return {
            data: response.data || [],
            error: response.error
        };
    },

    // Create new application
    createApplication: async (applicationData) => {
        try {
            // Fixed UUID for Aptos wallet users (fallback)
            const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

            // Ensure application data has the required fields
            if (!applicationData.job_id) {
                console.warn('No job_id provided for application');
                return {
                    error: {
                        message: 'Job ID is required'
                    }
                };
            }

            if (!applicationData.applicant_id) {
                console.warn('No applicant_id provided for application');
                return {
                    error: {
                        message: 'Applicant ID is required'
                    }
                };
            }

            // Process applicant_id if it's an Aptos wallet address
            if (typeof applicationData.applicant_id === 'object') {
                // If it's an object with a uuid property (from AuthContext), use that
                if (applicationData.applicant_id.uuid) {
                    applicationData.applicant_id = applicationData.applicant_id.uuid;
                    console.log('Using UUID from user object for application:', applicationData.applicant_id);
                } else if (applicationData.applicant_id.data instanceof Uint8Array) {
                    // Use fixed UUID
                    applicationData.applicant_id = APTOS_USER_UUID;
                    console.log('Using fixed UUID for Aptos user when creating application:', APTOS_USER_UUID);
                }
            }

            console.log('Creating application with data:', applicationData);

            // Remove any existing ID to let Supabase generate one
            const cleanData = { ...applicationData };
            delete cleanData.id;

            const response = await supabase
                .from('job_applications')
                .insert(cleanData)
                .select();

            if (response.error) {
                console.error('Supabase application creation error:', response.error);
                return {
                    data: null,
                    error: response.error
                };
            }

            return {
                data: response.data?.[0] || null,
                error: response.error
            };
        } catch (err) {
            console.error('Unexpected error during application creation:', err);
            return {
                data: null,
                error: {
                    message: 'Unexpected error during application creation',
                    details: err.message
                }
            };
        }
    },

    // Update application
    updateApplication: async (id, updates) => {
        return supabase
            .from('job_applications')
            .update(updates)
            .eq('id', id);
    },

    // Delete application
    deleteApplication: async (id) => {
        return supabase
            .from('job_applications')
            .delete()
            .eq('id', id);
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

        // Fixed UUID for Aptos wallet users (fallback)
        const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

        // Apply filters if any
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        if (filters.creator_id) {
            // Format the creator_id if it's an Aptos wallet object
            let formattedCreatorId = filters.creator_id;

            // If it's an object with a uuid property (from AuthContext), use that
            if (typeof filters.creator_id === 'object' && filters.creator_id.uuid) {
                formattedCreatorId = filters.creator_id.uuid;
                console.log('Using UUID from user object:', formattedCreatorId);
            } else if (typeof filters.creator_id === 'object' && filters.creator_id.data instanceof Uint8Array) {
                // Use fixed UUID for Aptos wallet addresses
                formattedCreatorId = APTOS_USER_UUID;
                console.log('Using fixed UUID for Aptos user in job lookup:', formattedCreatorId);
            } else if (typeof filters.creator_id === 'string' && filters.creator_id.startsWith('0x')) {
                // Also check if we should use the Aptos UUID for this hex address
                // This could be further refined based on application logic
            }

            query = query.eq('creator_id', formattedCreatorId);
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
        // Fixed UUID for Aptos wallet users (fallback)
        const APTOS_USER_UUID = '846ceff6-c234-4d14-b473-f6bcd0dff3af';

        // Process creator_id if it's an Aptos wallet address
        if (jobData.creator_id) {
            // If it's an object with a uuid property (from AuthContext), use that
            if (typeof jobData.creator_id === 'object' && jobData.creator_id.uuid) {
                jobData.creator_id = jobData.creator_id.uuid;
                console.log('Using UUID from user object for job creation:', jobData.creator_id);
            } else if (typeof jobData.creator_id === 'object' && jobData.creator_id.data instanceof Uint8Array) {
                // Use fixed UUID
                jobData.creator_id = APTOS_USER_UUID;
                console.log('Using fixed UUID for Aptos user when creating job:', APTOS_USER_UUID);
            }
        }

        try {
            // Prepare data for submission
            let processedData = { ...jobData };

            // Log the incoming job data
            console.log('Job creation raw data:', processedData);

            // Remove any existing ID to let Supabase generate one
            delete processedData.id;

            // Attempt to insert the job into Supabase
            const { data, error } = await supabase
                .from('jobs')
                .insert(processedData)
                .select();

            // Handle any errors from Supabase
            if (error) {
                console.error('Supabase error details:', error);
                throw error;
            }

            // Return the created job (single object, not array)
            return data?.[0] || null;
        } catch (err) {
            console.error('Unexpected error during job creation:', err);
            throw err;
        }
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
        try {
            // Ensure the job_id is valid and properly formatted
            if (!milestoneData.job_id) {
                console.warn('No job_id provided for milestone');
                throw new Error('Job ID is required for milestone creation');
            }

            // Remove any existing ID to let Supabase generate one
            const cleanData = { ...milestoneData };
            delete cleanData.id;

            const { error } = await supabase
                .from('milestones')
                .insert(cleanData);

            if (error) {
                console.error('Supabase milestone creation error:', error);
                throw error;
            }

            return true;
        } catch (err) {
            console.error('Unexpected error during milestone creation:', err);
            throw err;
        }
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