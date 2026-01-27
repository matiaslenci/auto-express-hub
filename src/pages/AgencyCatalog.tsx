import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleFilters, VehicleFiltersState } from '@/components/vehicles/VehicleFilters';
import { useAgency } from '@/hooks/useAgency';
import { useVehicles } from '@/hooks/useVehicles';
import { MapPin, Car, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const currentYear = new Date().getFullYear();

const defaultFilters: VehicleFiltersState = {
  marca: '',
  tipo: '',
  transmision: '',
  combustible: '',
  precioMin: 0,
  precioMax: 5000000,
  añoMin: 2000,
  añoMax: currentYear,
  search: '',
};

export default function AgencyCatalog() {
  const { username } = useParams<{ username: string }>();
  const { data: agency, isLoading: agencyLoading } = useAgency(username || '');
  const { data: allVehicles = [], isLoading: vehiclesLoading } = useVehicles({ agenciaUsername: username });

  const [filters, setFilters] = useState<VehicleFiltersState>(defaultFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter only active vehicles
  const vehicles = useMemo(() => allVehicles.filter(v => v.activo), [allVehicles]);

  const marcas = useMemo(() => {
    const uniqueMarcas = [...new Set(vehicles.map(v => v.marca))];
    return uniqueMarcas.sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (filters.search && !`${v.marca} ${v.modelo}`.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.marca && v.marca !== filters.marca) return false;
      if (filters.tipo && v.tipo !== filters.tipo) return false;
      if (filters.transmision && v.transmision !== filters.transmision) return false;
      if (filters.combustible && v.combustible !== filters.combustible) return false;
      // Skip price filter for CONSULTAR vehicles (precio is null)
      if (v.precio !== null && (v.precio < filters.precioMin || v.precio > filters.precioMax)) return false;
      if (v.año < filters.añoMin || v.año > filters.añoMax) return false;
      return true;
    });
  }, [vehicles, filters]);

  if (agencyLoading || vehiclesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Agencia no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              La agencia "{username}" no existe o ya no está disponible
            </p>
            <Link to="/">
              <Button variant="gradient">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero / Agency Header */}
      <div className="pt-16">
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5">
          {agency.portada && (
            <img
              src={agency.portada}
              alt={`${agency.nombre} portada`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card border-4 border-background overflow-hidden flex items-center justify-center shadow-xl">
              {agency.logo ? (
                <img src={agency.logo} alt={agency.nombre} className="w-full h-full object-cover" />
              ) : (
                <Car className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{agency.nombre}</h1>
              {agency.ubicacion && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{agency.ubicacion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredVehicles.length}</span> vehículo{filteredVehicles.length !== 1 && 's'} encontrado{filteredVehicles.length !== 1 && 's'}
          </p>
          <Button
            variant="outline"
            className="lg:hidden gap-2"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <VehicleFilters
                filters={filters}
                onFiltersChange={setFilters}
                marcas={marcas}
              />
            </div>
          </aside>

          {/* Filters - Mobile */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background p-6 overflow-y-auto animate-slide-in-right">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filtros</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <VehicleFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  marcas={marcas}
                />
                <Button
                  variant="gradient"
                  className="w-full mt-6"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Ver resultados
                </Button>
              </div>
            </div>
          )}

          {/* Vehicles Grid */}
          <div className="flex-1">
            {filteredVehicles.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      agencyUsername={agency.username}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron vehículos</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
