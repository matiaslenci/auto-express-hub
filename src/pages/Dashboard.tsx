import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { getVehiclesByAgency, Vehicle, PLAN_LIMITS, PLAN_NAMES } from '@/lib/storage';
import { Car, Eye, MessageCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { SEO } from '@/components/common/SEO';

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (user) {
      setVehicles(getVehiclesByAgency(user.username));
    }
  }, [user]);

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

  const activeVehicles = vehicles.filter(v => v.activo);
  const totalViews = vehicles.reduce((acc, v) => acc + v.vistas, 0);
  const totalWhatsappClicks = vehicles.reduce((acc, v) => acc + v.clicksWhatsapp, 0);
  const limit = PLAN_LIMITS[user?.plan || 'basico'];
  const usagePercent = limit === Infinity ? 0 : (activeVehicles.length / limit) * 100;

  const topVehicles = [...vehicles]
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 5);

  const stats = [
    {
      label: 'Vehículos activos',
      value: activeVehicles.length,
      icon: Car,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total de vistas',
      value: totalViews,
      icon: Eye,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Clicks WhatsApp',
      value: totalWhatsappClicks,
      icon: MessageCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Tasa conversión',
      value: totalViews > 0 ? `${((totalWhatsappClicks / totalViews) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];



  return (
    <DashboardLayout>
      <SEO title="Dashboard | AgenciaExpress" description="Resumen de tu agencia." />
      <div className="space-y-8">
        {/* Header */}
        <div className="dashboard-page-header">
          <h1>
            Hola, <span className="gradient-text">{user?.nombre}</span>
          </h1>
          <p>
            Aquí está el resumen de tu agencia
          </p>
        </div>

        {/* Plan Usage */}
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan actual</p>
              <p className="text-xl font-bold">{PLAN_NAMES[user?.plan || 'basico']}</p>
            </div>
            <div className={cn(
              "badge-plan",
              user?.plan === 'premium' ? 'badge-premium' :
                user?.plan === 'profesional' ? 'badge-profesional' : 'badge-basico'
            )}>
              {user?.plan === 'premium' ? 'Sin límites' : `${activeVehicles.length}/${limit} publicaciones`}
            </div>
          </div>
          {user?.plan !== 'premium' && (
            <Progress value={usagePercent} className="h-2" />
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Vehicles */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Vehículos más vistos</h2>
          </div>

          {topVehicles.length > 0 ? (
            <div className="space-y-4">
              {topVehicles.map((vehicle, index) => {
                const maxViews = topVehicles[0]?.vistas || 1;
                const percentage = (vehicle.vistas / maxViews) * 100;

                return (
                  <div key={vehicle.id} className="flex items-center gap-4">
                    <span className="w-6 text-center font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={vehicle.fotos[0] || '/placeholder-vehicle.svg'}
                        alt={`${vehicle.marca} ${vehicle.modelo}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {vehicle.marca} {vehicle.modelo} {vehicle.anio}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {vehicle.vistas} vistas
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no tienes vehículos publicados</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
