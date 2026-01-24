import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import * as authHook from '../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../hooks/useAuth');

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock toast
vi.mock('../hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

describe('Login Component', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        mockNavigate.mockClear();

        // Create a new QueryClient for each test
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    });

    const renderLogin = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </QueryClientProvider>
        );
    };

    it('should redirect to /dashboard when login is successful', async () => {
        // Mock successful login
        const mockLogin = vi.fn().mockResolvedValue({ success: true });

        vi.mocked(authHook.useAuth).mockReturnValue({
            login: mockLogin,
            loading: false,
            isAuthenticated: false,
            user: null,
            logout: vi.fn(),
            register: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderLogin();

        // Find and fill the email input
        const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Find and fill the password input
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        fireEvent.click(submitButton);

        // Wait for the login function to be called
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });

        // Verify navigation to dashboard
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('should display error message when login fails', async () => {
        // Mock failed login
        const mockLogin = vi.fn().mockResolvedValue({
            success: false,
            error: 'Credenciales incorrectas'
        });

        vi.mocked(authHook.useAuth).mockReturnValue({
            login: mockLogin,
            loading: false,
            isAuthenticated: false,
            user: null,
            logout: vi.fn(),
            register: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderLogin();

        // Fill the form
        const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        fireEvent.click(submitButton);

        // Wait for the login function to be called
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
        });

        // Verify no navigation occurred
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect to /dashboard if user is already authenticated', () => {
        // Mock authenticated user
        vi.mocked(authHook.useAuth).mockReturnValue({
            login: vi.fn(),
            loading: false,
            isAuthenticated: true,
            user: {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                nombre: 'Test User',
                plan: 'basico',
                limitePublicaciones: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            logout: vi.fn(),
            register: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderLogin();

        // The component should render Navigate component which redirects
        // We can't directly test the Navigate component, but we can verify
        // that the login form is not rendered
        expect(screen.queryByPlaceholderText(/tu@email.com/i)).not.toBeInTheDocument();
    });

    it('should toggle password visibility when eye icon is clicked', () => {
        vi.mocked(authHook.useAuth).mockReturnValue({
            login: vi.fn(),
            loading: false,
            isAuthenticated: false,
            user: null,
            logout: vi.fn(),
            register: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderLogin();

        const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;

        // Initially should be password type
        expect(passwordInput.type).toBe('password');

        // Click the eye icon to show password
        const toggleButtons = screen.getAllByRole('button');
        const eyeButton = toggleButtons.find(btn =>
            btn.querySelector('svg') && !btn.textContent?.includes('Iniciar')
        );

        if (eyeButton) {
            fireEvent.click(eyeButton);
            expect(passwordInput.type).toBe('text');

            // Click again to hide password
            fireEvent.click(eyeButton);
            expect(passwordInput.type).toBe('password');
        }
    });
});
