import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyAnalytics } from '@/hooks/useVehicles';
import {
    BarChart3,
    TrendingUp,
    Eye,
    MessageCircle,
    ArrowUpRight,
    ArrowDownRight,
    MousePointer2,
    Trophy,
    Car,
    Bike
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { SEO } from '@/components/common/SEO';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardAnalytics() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { data: summary, isLoading: analyticsLoading } = useAgencyAnalytics();

    if (authLoading || analyticsLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const stats = [
        {
            label: 'Total de Vistas',
            value: summary?.totalViews || 0,
            icon: Eye,
            color: 'text-info',
            bgColor: 'bg-info/10',
        },
        {
            label: 'Clicks WhatsApp',
            value: summary?.totalClicks || 0,
            icon: MessageCircle,
            color: 'text-success',
            bgColor: 'bg-success/10',
        },
        {
            label: 'Tasa de Conversión',
            value: `${(summary?.conversionRate || 0).toFixed(1)}%`,
            icon: MousePointer2,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
        },
        {
            label: 'Interacción',
            value: summary?.totalViews ? ((summary.totalClicks || 0) / summary.totalViews * 10).toFixed(1) : '0',
            icon: TrendingUp,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
    ];

    const chartData = summary?.dailyHistory?.map(item => ({
        name: format(parseISO(item.date), 'dd MMM', { locale: es }),
        views: item.viewsCount,
        clicks: item.clicksCount,
    })) || [];

    return (
        <DashboardLayout>
            <SEO title="Analíticas | CatálogoVehículos" description="Análisis de rendimiento de tu agencia." />

            <div className="space-y-8">
                <div className="dashboard-page-header">
                    <h1>
                        Analíticas de <span className="gradient-text">Rendimiento</span>
                    </h1>
                    <p>Resultados y estadísticas de tus publicaciones</p>
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

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Trend Chart */}
                    <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Tendencia de Visitas</h2>
                            </div>
                            <select className="bg-background border border-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option>Últimos 7 días</option>
                                <option>Últimos 30 días</option>
                            </select>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#f43f5e"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Rankings */}
                    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center gap-2 mb-8">
                            <Trophy className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">Top Interés</h2>
                        </div>

                        <div className="space-y-6">
                            {summary?.topVehicles?.map((vehicle, index) => (
                                <div key={vehicle.id} className="group relative pr-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {vehicle.fotos?.length > 0 ? (
                                                <img
                                                    src={vehicle.fotos[0]}
                                                    alt={vehicle.modelo}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300">
                                                    {vehicle.tipoVehiculo === 'MOTO' ? (
                                                        <Bike className="h-6 w-6" strokeWidth={1} />
                                                    ) : (
                                                        <Car className="h-6 w-6" strokeWidth={1} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{vehicle.marca} {vehicle.modelo}</p>
                                            <p className="text-xs text-muted-foreground">{vehicle.vistas} vistas • {vehicle.clicksWhatsapp} clicks</p>
                                        </div>
                                    </div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-right">
                                        <p className="text-sm font-bold text-success">
                                            {((vehicle.clicksWhatsapp || 0) / (vehicle.vistas || 1) * 100).toFixed(0)}%
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conv.</p>
                                    </div>
                                </div>
                            ))}

                            {(!summary?.topVehicles || summary.topVehicles.length === 0) && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Sin datos suficientes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
