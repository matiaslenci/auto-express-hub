import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/api/adminApi';
import { AgencyDto } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/common/SEO';

export default function DashboardAdmin() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: agencies = [], isLoading: agenciesLoading } = useQuery({
        queryKey: ['admin-agencies'],
        queryFn: adminApi.getAllAgencies,
        enabled: isAuthenticated && !!user?.isAdmin,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            adminApi.updateAgencyStatus(id, isActive),
        onSuccess: (updatedAgency) => {
            queryClient.setQueryData(['admin-agencies'], (old: AgencyDto[] = []) =>
                old.map((agency) => (agency.id === updatedAgency.id ? updatedAgency : agency))
            );
            toast({
                title: 'Estado actualizado',
                description: `Agencia vinculada a ${updatedAgency.username} está ahora ${updatedAgency.isActive ? 'Activa' : 'Inactiva'
                    }.`,
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo actualizar el estado.',
                variant: 'destructive',
            });
        },
    });

    const planMutation = useMutation({
        mutationFn: ({ id, plan }: { id: string; plan: 'basico' | 'profesional' | 'premium' }) =>
            adminApi.updateAgencyPlan(id, plan),
        onSuccess: (updatedAgency) => {
            queryClient.setQueryData(['admin-agencies'], (old: AgencyDto[] = []) =>
                old.map((agency) => (agency.id === updatedAgency.id ? updatedAgency : agency))
            );
            toast({
                title: 'Plan actualizado',
                description: `Plan de ${updatedAgency.username} cambiado a ${updatedAgency.plan}.`,
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo actualizar el plan.',
                variant: 'destructive',
            });
        },
    });

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <DashboardLayout>
            <SEO title="Panel de Administración | CatálogoVehículos" description="Administración general de agencias." />

            <div className="space-y-6">
                <div className="dashboard-page-header">
                    <h1>Panel de Administración</h1>
                    <p>Gestiona todas las agencias registradas en la plataforma</p>
                </div>

                <div className="glass-card overflow-hidden">
                    {agenciesLoading ? (
                        <div className="p-12 flex justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agencia</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Fecha Registro</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agencies.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No hay agencias registradas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        agencies.map((agency) => (
                                            <TableRow key={agency.id}>
                                                <TableCell>
                                                    <div className="font-medium">{agency.nombre || 'Sin Nombre'}</div>
                                                    <div className="text-sm text-muted-foreground">@{agency.username}</div>
                                                </TableCell>
                                                <TableCell>{agency.email}</TableCell>
                                                <TableCell>
                                                    {new Date(agency.createdAt).toLocaleDateString('es-AR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={agency.plan}
                                                        onValueChange={(value: any) =>
                                                            planMutation.mutate({ id: agency.id, plan: value })
                                                        }
                                                        disabled={planMutation.isPending}
                                                    >
                                                        <SelectTrigger className="w-[140px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="basico">Básico</SelectItem>
                                                            <SelectItem value="profesional">Profesional</SelectItem>
                                                            <SelectItem value="premium">Premium</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={agency.isActive}
                                                            onCheckedChange={(checked) =>
                                                                statusMutation.mutate({ id: agency.id, isActive: checked })
                                                            }
                                                            disabled={statusMutation.isPending || agency.isAdmin}
                                                        />
                                                        <Badge variant={agency.isActive ? 'default' : 'secondary'}>
                                                            {agency.isActive ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                        {agency.isAdmin && (
                                                            <Badge variant="outline" className="ml-2 border-primary text-primary">
                                                                Admin
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
