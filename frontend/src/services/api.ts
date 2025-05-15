import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error);

        // Handle unauthorized errors
        if (error.response && error.response.status === 401) {
            // If the session is invalid, clear local storage and redirect to login
            if (
                !window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')
            ) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login?session=expired';
            }
        }

        return Promise.reject(error);
    }
);

// Types for API responses
export interface ApiResponse<T> {
    message?: string;
    user?: any;
    session?: any;
    job?: any;
    jobs?: any[];
    milestone?: any;
    milestones?: any[];
    data?: T;
}

export interface AuthResponse {
    user: any;
    session: any;
}

export interface UserProfile {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    skills?: string[];
}

// User authentication API calls
export const userApi = {
    login: (credentials: { email: string; password: string }) =>
        api.post<ApiResponse<AuthResponse>>('/auth/login', credentials),

    register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
        api.post<ApiResponse<AuthResponse>>('/auth/register', userData),

    updateProfile: (data: Partial<UserProfile>) =>
        api.patch<ApiResponse<UserProfile>>('/users/profile', data),
};

// Aptos authentication API calls
export const aptosApi = {
    loginWithAptos: (data: { address: string; signature: string; message: string }) =>
        api.post<ApiResponse<AuthResponse>>('/auth/aptos', data),

    loginWithGoogle: (data: { idToken: string }) =>
        api.post<ApiResponse<AuthResponse>>('/auth/aptos-google', data),

    loginWithApple: (data: { idToken: string }) =>
        api.post<ApiResponse<AuthResponse>>('/auth/aptos-apple', data),
};

export default api; 