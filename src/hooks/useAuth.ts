import { useState, useEffect, useCallback } from 'react';
import { 
  Agency, 
  getCurrentUser, 
  login as authLogin, 
  logout as authLogout,
  createAgency,
  getAgencyByEmail,
  getAgencyByUsername,
  PLAN_LIMITS,
} from '@/lib/storage';

export function useAuth() {
  const [user, setUser] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const agency = authLogin(email, password);
    if (agency) {
      setUser(agency);
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas' };
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    username: string;
    nombre: string;
    plan: 'basico' | 'profesional' | 'premium';
  }): Promise<{ success: boolean; error?: string }> => {
    // Check if email exists
    if (getAgencyByEmail(data.email)) {
      return { success: false, error: 'Este email ya está registrado' };
    }

    // Check if username exists
    if (getAgencyByUsername(data.username)) {
      return { success: false, error: 'Este nombre de usuario ya está en uso' };
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      return { success: false, error: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos' };
    }

    try {
      const agency = createAgency({
        email: data.email,
        password: data.password,
        username: data.username.toLowerCase(),
        nombre: data.nombre,
        logo: '',
        portada: '',
        ubicacion: '',
        whatsapp: '',
        plan: data.plan,
        limitePublicaciones: PLAN_LIMITS[data.plan],
      });

      setUser(agency);
      authLogin(data.email, data.password);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al crear la cuenta' };
    }
  }, []);

  const refreshUser = useCallback(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

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
