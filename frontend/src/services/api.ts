import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface AptosLoginData {
    walletAddress: string;
    message: string;
    signedMessage: string;
}

interface GoogleAptosLoginData {
    walletAddress: string;
    googleToken: string;
}

interface AppleAptosLoginData {
    walletAddress: string;
    appleToken: string;
}

interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    walletAddress: string;
    reputation: number;
}

interface ApiResponse<T> {
    data: T;
    message?: string;
}

interface AuthResponse {
    access_token: string;
    user: UserProfile;
}

// User authentication API calls
export const userApi = {
    login: (credentials: LoginCredentials) => 
        api.post<ApiResponse<AuthResponse>>('/auth/login', credentials),
    
    register: (userData: RegisterData) => 
        api.post<ApiResponse<AuthResponse>>('/auth/register', userData),
    
    updateProfile: (data: Partial<UserProfile>) => 
        api.patch<ApiResponse<UserProfile>>('/users/profile', data),
};

// Aptos authentication API calls
export const aptosApi = {
    loginWithAptos: (data: AptosLoginData) => 
        api.post<ApiResponse<AuthResponse>>('/auth/aptos', data),
    
    loginWithGoogle: (data: GoogleAptosLoginData) => 
        api.post<ApiResponse<AuthResponse>>('/auth/aptos-google', data),
    
    loginWithApple: (data: AppleAptosLoginData) => 
        api.post<ApiResponse<AuthResponse>>('/auth/aptos-apple', data),
};

export default api; 