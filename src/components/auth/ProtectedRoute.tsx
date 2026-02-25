import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !user?.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
