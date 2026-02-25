import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Token management
const TOKEN_KEY = 'agencia_express_token';

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<ApiError>) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const apiError = error.response.data;

            // Handle 401 Unauthorized - clear token
            // The React AuthContext will handle the redirect to login
            if (error.response.status === 401) {
                removeToken();
            }

            // Format error message
            const errorMessage = Array.isArray(apiError?.message)
                ? apiError.message.join(', ')
                : apiError?.message || 'Error en la solicitud';

            return Promise.reject({
                message: errorMessage,
                statusCode: error.response.status,
                originalError: error,
            });
        } else if (error.request) {
            // Request was made but no response received
            return Promise.reject({
                message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                statusCode: 0,
                originalError: error,
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'Error desconocido',
                statusCode: 0,
                originalError: error,
            });
        }
    }
);

export default apiClient;
