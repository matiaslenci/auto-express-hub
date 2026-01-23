import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { getVehiclesByAgency, Vehicle, deleteVehicle, updateVehicle } from '@/lib/storage';
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
  PowerOff
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

import { SEO } from '@/components/common/SEO';

export default function DashboardVehicles() {
  const { user, loading, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = () => {
    if (user) {
      setVehicles(getVehiclesByAgency(user.username));
    }
  };

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

  const filteredVehicles = vehicles.filter(v =>
    `${v.marca} ${v.modelo} ${v.año}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = (vehicle: Vehicle) => {
    updateVehicle(vehicle.id, { activo: !vehicle.activo });
    loadVehicles();
    toast({
      title: vehicle.activo ? 'Vehículo desactivado' : 'Vehículo activado',
      description: vehicle.activo ? 'Ya no aparecerá en tu catálogo' : 'Ahora aparece en tu catálogo',
    });
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id);
      loadVehicles();
      toast({
        title: 'Vehículo eliminado',
        description: 'El vehículo ha sido eliminado de tu inventario.',
      });
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(price);



  return (
    <DashboardLayout>
      <SEO title="Mis Vehículos | AgenciaExpress" description="Gestiona tu inventario de vehículos." />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mis vehículos</h1>
            <p className="text-muted-foreground">
              {vehicles.length} vehículo{vehicles.length !== 1 && 's'} en tu inventario
            </p>
          </div>
          <Link to="/dashboard/vehiculos/nuevo">
            <Button variant="gradient" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo vehículo
            </Button>
          </Link>
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
                  "glass-card overflow-hidden transition-all duration-300",
                  !vehicle.activo && "opacity-60"
                )}
              >
                {/* Image */}
                <div className="relative aspect-video">
                  <img
                    src={vehicle.fotos[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop'}
                    alt={`${vehicle.marca} ${vehicle.modelo}`}
                    className="w-full h-full object-cover"
                  />
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
                      <p className="text-sm text-muted-foreground">{vehicle.año}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(vehicle.precio)}
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
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'No se encontraron vehículos' : 'Sin vehículos'}
            </h3>
            <p className="text-muted-foreground mb-6">
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
    </DashboardLayout>
  );
}
