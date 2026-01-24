import apiClient, { setToken, removeToken } from '../client';
import { RegisterDto, LoginDto, AuthResponse } from '../types';

export const authService = {
    /**
     * Register a new agency account
     * POST /auth/register
     */
    async register(data: RegisterDto): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);

        // Store token on successful registration
        if (response.data.access_token) {
            setToken(response.data.access_token);
        }

        return response.data;
    },

    /**
     * Login with email and password
     * POST /auth/login
     */
    async login(data: LoginDto): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);

        // Store token on successful login
        if (response.data.access_token) {
            setToken(response.data.access_token);
        }

        return response.data;
    },

    /**
     * Logout - clear token
     */
    logout(): void {
        removeToken();
    },
};
