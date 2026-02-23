import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '@/api/services/auth.service';
import { agencyService } from '@/api/services/agency.service';
import { getToken } from '@/api/client';
import { AgencyDto, RegisterDto } from '@/api/types';

interface AuthContextType {
    user: AgencyDto | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    register: (data: {
        email: string;
        password: string;
        username: string;
        nombre: string;
        plan: 'basico' | 'profesional' | 'premium';
    }) => Promise<{ success: boolean; error?: string }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AgencyDto | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from token on mount — runs only ONCE for the entire app
    useEffect(() => {
        const loadUser = async () => {
            const token = getToken();
            console.log('[AuthProvider] Token encontrado:', !!token);
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('[AuthProvider] Payload del token:', payload);

                    // Verificar si el token está expirado
                    if (payload.exp && payload.exp * 1000 < Date.now()) {
                        console.log('[AuthProvider] Token expirado');
                        authService.logout();
                        setLoading(false);
                        return;
                    }

                    if (payload.username) {
                        console.log('[AuthProvider] Buscando agencia para:', payload.username);
                        const agency = await agencyService.getAgencyByUsername(payload.username);
                        console.log('[AuthProvider] Agencia cargada:', agency);
                        setUser(agency);
                    } else {
                        console.log('[AuthProvider] No hay username en el token. Campos:', Object.keys(payload));
                    }
                } catch (error) {
                    console.error('[AuthProvider] Error al cargar usuario:', error);
                    // Solo hacer logout si el error es de autenticación (401)
                    const statusCode = (error as any)?.statusCode;
                    if (statusCode === 401) {
                        authService.logout();
                    }
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setLoading(true);
            const response = await authService.login({ email, password });
            setUser(response.agency);
            setLoading(false);
            return { success: true };
        } catch (error: any) {
            setLoading(false);
            console.error('Error de inicio de sesión:', error);
            return {
                success: false,
                error: error.message || 'Credenciales incorrectas'
            };
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const register = useCallback(async (data: {
        email: string;
        password: string;
        username: string;
        nombre: string;
        plan: 'basico' | 'profesional' | 'premium';
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            const registerData: RegisterDto = {
                email: data.email,
                password: data.password,
                username: data.username.toLowerCase(),
                nombre: data.nombre,
                plan: data.plan,
            };

            const response = await authService.register(registerData);
            setUser(response.agency);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Error al crear la cuenta'
            };
        }
    }, []);

    const refreshUser = useCallback(async () => {
        if (user) {
            try {
                const updatedUser = await agencyService.getAgencyByUsername(user.username);
                setUser(updatedUser);
            } catch (error) {
                console.error('Error al actualizar usuario:', error);
            }
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            register,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
