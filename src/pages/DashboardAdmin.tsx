import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/api/adminApi';
import { vehicleService } from '@/api/services/vehicle.service';
import { uploadService } from '@/api/services/upload.service';
import { AgencyDto } from '@/api/types';
import { PLAN_LIMITS } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { Loader2, Trash2 } from 'lucide-react';

export default function DashboardAdmin() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: agencies = [], isLoading: agenciesLoading } = useQuery({
        queryKey: ['admin-agencies'],
        queryFn: adminApi.getAllAgencies,
        enabled: isAuthenticated && !!user?.isAdmin,
    });

    const cleanupMutation = useMutation({
        mutationFn: () => uploadService.cleanupOrphanFiles(),
        onSuccess: (data) => {
            toast({
                title: data.count > 0
                    ? `Se eliminaron ${data.count} archivo(s) huérfano(s)`
                    : 'No se encontraron archivos huérfanos',
                description: data.count > 0
                    ? `Archivos eliminados: ${data.deleted.join(', ')}`
                    : 'El almacenamiento está limpio.',
            });
        },
        onError: (error: any) => {
            const status = error?.response?.status || error?.statusCode;
            toast({
                title: 'Error',
                description: status === 403
                    ? 'No tenés permisos de administrador.'
                    : error.message || 'No se pudo ejecutar la limpieza.',
                variant: 'destructive',
            });
        },
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
        mutationFn: ({ id, plan }: { id: string; plan: 'gratuito' | 'basico' | 'profesional' | 'premium' }) =>
            adminApi.updateAgencyPlan(id, plan),
        onSuccess: async (updatedAgency) => {
            queryClient.setQueryData(['admin-agencies'], (old: AgencyDto[] = []) =>
                old.map((agency) => (agency.id === updatedAgency.id ? updatedAgency : agency))
            );

            // Hard downgrade: deactivate excess vehicles
            const newLimit = PLAN_LIMITS[updatedAgency.plan];
            if (newLimit !== Infinity) {
                try {
                    const vehicles = await vehicleService.getVehicles({ agenciaUsername: updatedAgency.username });
                    const activeVehicles = vehicles
                        .filter(v => v.activo)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    if (activeVehicles.length > newLimit) {
                        const vehiclesToDeactivate = activeVehicles.slice(newLimit);
                        await Promise.all(
                            vehiclesToDeactivate.map(v => vehicleService.updateVehicle(v.id, { activo: false }))
                        );
                        toast({
                            title: 'Vehículos desactivados',
                            description: `Se desactivaron ${vehiclesToDeactivate.length} vehículo(s) que excedían el límite del nuevo plan.`,
                        });
                    }
                } catch (error) {
                    toast({
                        title: 'Advertencia',
                        description: 'No se pudieron desactivar los vehículos excedentes automáticamente.',
                        variant: 'destructive',
                    });
                }
            }

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

                {/* Herramientas */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Herramientas</h2>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => cleanupMutation.mutate()}
                            disabled={cleanupMutation.isPending}
                            className="gap-2"
                        >
                            {cleanupMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Limpiando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Limpiar almacenamiento
                                </>
                            )}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Elimina archivos de imagen que no están asociados a ningún vehículo ni agencia.
                        </p>
                    </div>
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
                                                            <SelectItem value="gratuito">Gratuito</SelectItem>
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
