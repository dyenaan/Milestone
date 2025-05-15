import axios from 'axios';

// Create axios instance
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// User API calls
export const userApi = {
    getCurrentUser: () => api.get('/users/me'),
    updateProfile: (userData) => api.patch('/users/profile', userData),
};

// Aptos API calls
export const aptosApi = {
    loginWithAptos: (walletData) => api.post('/auth/aptos', walletData),
    loginWithGoogle: (loginData) => api.post('/auth/aptos/google', loginData),
    loginWithApple: (loginData) => api.post('/auth/aptos/apple', loginData),
};

// Jobs API calls
export const jobsApi = {
    getJobs: async (params) => {
        try {
            const response = await api.get('/jobs', { params });
            // Check if the response has a jobs property or is an array itself
            return {
                data: Array.isArray(response.data)
                    ? response.data
                    : (response.data.jobs || [])
            };
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }
    },

    getJobById: async (id) => {
        try {
            const response = await api.get(`/jobs/${id}`);
            // Check if the response has a job property or is the job object itself
            return {
                data: response.data.job || response.data
            };
        } catch (error) {
            console.error(`Error fetching job ${id}:`, error);
            throw error;
        }
    },

    createJob: (jobData) => api.post('/jobs', jobData),
    updateJob: (id, jobData) => api.patch(`/jobs/${id}`, jobData),
    deleteJob: (id) => api.delete(`/jobs/${id}`),

    // Milestone-related methods
    getMilestones: (jobId) => api.get(`/jobs/${jobId}/milestones`),
    createMilestone: (jobId, milestoneData) => api.post(`/jobs/${jobId}/milestones`, milestoneData),
};

// Milestones API calls
export const milestonesApi = {
    getMilestonesByJob: (jobId) => api.get(`/milestones/job/${jobId}`),
    getMilestone: (id) => api.get(`/milestones/${id}`),
    createMilestone: (milestoneData) => api.post('/milestones', milestoneData),
    createMilestoneForJob: (jobId, milestoneData) => api.post(`/jobs/${jobId}/milestones`, milestoneData),
    updateMilestone: (id, milestoneData) => api.patch(`/milestones/${id}`, milestoneData),
    deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};

// Export default api for other custom requests
export default api; 