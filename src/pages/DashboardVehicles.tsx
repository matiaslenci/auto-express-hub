import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles, useDeleteVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import { VehicleDto } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Eye,
  MessageCircle,
  Trash2,
  Edit,
  MoreVertical,
  Power,
  PowerOff,
  Car,
  Bike
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS, PLAN_NAMES } from '@/lib/storage';
import { PlanLimitModal } from '@/components/ui/PlanLimitModal';

import { SEO } from '@/components/common/SEO';

export default function DashboardVehicles() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles({ agenciaUsername: user?.username });
  const deleteVehicleMutation = useDeleteVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleDto | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { toast } = useToast();

  if (loading || vehiclesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const filteredVehicles = vehicles.filter(v =>
    `${v.marca} ${v.modelo} ${v.anio}`.toLowerCase().includes(search.toLowerCase())
  );

  // Plan limits calculation
  const activeVehicles = vehicles.filter(v => v.activo);
  const limit = PLAN_LIMITS[user?.plan || 'basico'];
  const canAddMore = limit === Infinity || activeVehicles.length < limit;
  const planName = PLAN_NAMES[user?.plan || 'basico'];
  const limitDisplay = limit === Infinity
    ? 'Sin límite'
    : `${activeVehicles.length} / ${limit} publicaciones`;

  const handleToggleActive = async (vehicle: VehicleDto) => {
    try {
      await updateVehicleMutation.mutateAsync({
        id: vehicle.id,
        data: { activo: !vehicle.activo }
      });
      toast({
        title: vehicle.activo ? 'Vehículo desactivado' : 'Vehículo activado',
        description: vehicle.activo ? 'Ya no aparecerá en tu catálogo' : 'Ahora aparece en tu catálogo',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el vehículo',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (vehicle: VehicleDto) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicleMutation.mutateAsync(vehicleToDelete.id);
        toast({
          title: 'Vehículo eliminado',
          description: 'El vehículo ha sido eliminado de tu inventario.',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'No se pudo eliminar el vehículo',
          variant: 'destructive',
        });
      }
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const formatPrice = (price: number | null, moneda: string = 'ARS') => {
    if (moneda === 'CONSULTAR' || price === null) {
      return 'Consultar';
    }
    const currency = moneda === 'USD' ? 'USD' : 'ARS';
    const formatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
    return moneda === 'USD' ? formatted.replace('US$', 'US$ ') : formatted;
  };



  return (
    <DashboardLayout>
      <SEO title="Mis Vehículos | CatálogoVehículos" description="Gestiona tu inventario de vehículos." />
      <div className="space-y-6">
        {/* Header */}
        <div className="dashboard-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1>Mis vehículos</h1>
            <p>
              {vehicles.length} vehículo{vehicles.length !== 1 && 's'} en tu inventario
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Publication counter badge */}
            <div className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium",
              limit === Infinity
                ? "bg-primary/10 text-primary"
                : activeVehicles.length >= (limit as number)
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            )}>
              {limitDisplay}
            </div>

            {canAddMore ? (
              <Link to="/dashboard/vehiculos/nuevo">
                <Button variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo vehículo
                </Button>
              </Link>
            ) : (
              <Button
                variant="gradient"
                className="gap-2 opacity-50 cursor-not-allowed"
                onClick={() => setShowLimitModal(true)}
              >
                <Plus className="h-4 w-4" />
                Nuevo vehículo
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vehículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-glow"
          />
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={cn(
                  "glass-card overflow-hidden transition-all duration-300 animate-fade-in-up",
                  !vehicle.activo && "opacity-60"
                )}
                style={{ animationDelay: `${filteredVehicles.indexOf(vehicle) * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {vehicle.fotos.length > 0 ? (
                    <img
                      src={vehicle.fotos[0]}
                      alt={`${vehicle.marca} ${vehicle.modelo}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground/30">
                      {vehicle.tipoVehiculo === 'MOTO' ? (
                        <Bike className="h-12 w-12" strokeWidth={1} />
                      ) : (
                        <Car className="h-12 w-12" strokeWidth={1} />
                      )}
                      <span className="text-[10px] uppercase tracking-wider mt-2 font-medium">Sin fotos</span>
                    </div>
                  )}
                  {!vehicle.activo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">
                        Inactivo
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold">
                        {vehicle.marca} {vehicle.modelo}
                      </h3>
                      <p className="text-sm text-muted-foreground">{vehicle.anio}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(vehicle.precio, vehicle.moneda)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{vehicle.vistas}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{vehicle.clicksWhatsapp}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/vehiculos/${vehicle.id}/editar`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/${user?.username}/${vehicle.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(vehicle)}>
                          {vehicle.activo ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(vehicle)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 empty-state">
            <div className="empty-state-icon">
              <Search />
            </div>
            <h3>
              {search ? 'No se encontraron vehículos' : 'Sin vehículos'}
            </h3>
            <p>
              {search
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer vehículo'}
            </p>
            {!search && (
              <Link to="/dashboard/vehiculos/nuevo">
                <Button variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar vehículo
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El vehículo será eliminado permanentemente de tu inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Plan Limit Modal */}
      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        plan={user?.plan || 'basico'}
        limite={limit === Infinity ? 0 : (limit as number)}
      />
    </DashboardLayout>
  );
}
