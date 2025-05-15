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
        console.error('API Error:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);

            // Handle unauthorized errors - logout the user
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// User API calls
export const userApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/users/profile'),
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
    getJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    createJob: (jobData) => api.post('/jobs', jobData),
    updateJob: (id, jobData) => api.patch(`/jobs/${id}`, jobData),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// Milestones API calls
export const milestonesApi = {
    getMilestonesByJobId: (jobId) => api.get(`/jobs/${jobId}/milestones`),
    getMilestoneById: (id) => api.get(`/jobs/milestones/${id}`),
    createMilestone: (jobId, milestoneData) => api.post(`/jobs/${jobId}/milestones`, milestoneData),
    updateMilestone: (id, milestoneData) => api.patch(`/jobs/milestones/${id}`, milestoneData),
    deleteMilestone: (id) => api.delete(`/jobs/milestones/${id}`),
};

// Export default api for other custom requests
export default api; 