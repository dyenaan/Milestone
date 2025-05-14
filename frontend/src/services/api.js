import axios from 'axios';

// Create axios instance
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
    getCurrentUser: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.patch('/users/profile', userData),
};

// Aptos authentication API calls
export const aptosApi = {
    loginWithAptos: (data) => api.post('/auth/aptos', data),
    loginWithGoogle: (data) => api.post('/auth/aptos-google', data),
    loginWithApple: (data) => api.post('/auth/aptos-apple', data),
};

// Jobs API calls
export const jobsApi = {
    getJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    createJob: (jobData) => api.post('/jobs', jobData),
    updateJob: (id, jobData) => api.patch(`/jobs/${id}`, jobData),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// Blockchain API calls
export const blockchainApi = {
    createProject: (data) => api.post('/blockchain/project', data),
    getProject: (id) => api.get(`/blockchain/project/${id}`),
    addMilestone: (projectId, data) => api.post(`/blockchain/project/${projectId}/milestone`, data),
    fundProject: (projectId, data) => api.post(`/blockchain/project/${projectId}/fund`, data),
    startWork: (projectId, data) => api.post(`/blockchain/project/${projectId}/start`, data),
    submitMilestone: (projectId, milestoneId, data) =>
        api.post(`/blockchain/project/${projectId}/milestone/${milestoneId}/submit`, data),
    reviewMilestone: (projectId, milestoneId, data) =>
        api.post(`/blockchain/project/${projectId}/milestone/${milestoneId}/review`, data),
    completeMilestone: (projectId, milestoneId) =>
        api.post(`/blockchain/project/${projectId}/milestone/${milestoneId}/complete`),
};

// Reviews API calls
export const reviewsApi = {
    createReview: (reviewData) => api.post('/reviews', reviewData),
    getReviewsForJob: (jobId) => api.get(`/reviews/job/${jobId}`),
    getReviewsForUser: (userId) => api.get(`/reviews/user/${userId}`),
};

// Export default api for other custom requests
export default api; 