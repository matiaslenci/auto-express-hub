import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Car,
  LayoutDashboard,
  Plus,
  User,
  BarChart3,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLAN_NAMES } from '@/lib/storage';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/analiticas', icon: BarChart3, label: 'Analíticas' },
  { href: '/dashboard/vehiculos', icon: Car, label: 'Vehículos' },
  { href: '/dashboard/vehiculos/nuevo', icon: Plus, label: 'Nuevo vehículo' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const planClass = user?.plan === 'premium' ? 'badge-premium' :
    user?.plan === 'profesional' ? 'badge-profesional' : 'badge-basico';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-xl border-b border-border flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/icono.png" alt="Logo" className="h-7 w-7" />
            <span className="text-base font-bold">Catálogo<span className="text-primary">Vehículos</span></span>
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <img src="/assets/icono.png" alt="Logo" className="h-8 w-8" />
                <span className="text-base font-bold">Catálogo<span className="text-primary">Vehículos</span></span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user?.logo ? (
                  <img src={user.logo} alt={user.nombre} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.nombre}</p>
                <span className={cn("badge-plan", planClass)}>
                  {PLAN_NAMES[user?.plan || 'basico']}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {[
              ...navItems,
              ...(user?.isAdmin ? [{ href: '/dashboard/admin', icon: Shield, label: 'Admin' }] : [])
            ].map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Link
              to={`/${user?.username}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="font-medium">Ver catálogo</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
