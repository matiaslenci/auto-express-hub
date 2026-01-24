import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/api/services/auth.service';
import { agencyService } from '@/api/services/agency.service';
import { getToken } from '@/api/client';
import { AgencyDto, RegisterDto, LoginDto } from '@/api/types';
import { PLAN_LIMITS } from '@/lib/storage';

export function useAuth() {
  const [user, setUser] = useState<AgencyDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          // Decode token to get username (JWT payload is base64 encoded)
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.username) {
            const agency = await agencyService.getAgencyByUsername(payload.username);
            setUser(agency);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.agency);
      return { success: true };
    } catch (error: any) {
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
        console.error('Error refreshing user:', error);
      }
    }
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser,
  };
}
