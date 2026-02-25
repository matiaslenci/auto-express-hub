import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleFilters, VehicleFiltersState } from '@/components/vehicles/VehicleFilters';
import { useAgency } from '@/hooks/useAgency';
import { useVehicles } from '@/hooks/useVehicles';
import { MapPin, Car, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { TIPO_CAMBIO_USD } from '@/lib/constants';

const currentYear = new Date().getFullYear();

const defaultFilters: VehicleFiltersState = {
  tipoVehiculo: '',
  marca: '',
  tipo: '',
  transmision: '',
  combustible: '',
  precioMin: 0,
  precioMax: 50000000,
  monedaFiltro: 'ARS',
  anioMin: 2000,
  anioMax: currentYear,
  kilometrajeMin: 0,
  kilometrajeMax: 500000,
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

  // Calcular el precio máximo del catálogo (convertido a la moneda del filtro)
  const precioMaxCatalogo = useMemo(() => {
    if (vehicles.length === 0) return filters.monedaFiltro === 'USD' ? 50000 : 50000000;

    let maxPrecio = 0;
    for (const v of vehicles) {
      if (v.precio === null) continue;

      let precioConvertido: number;
      if (filters.monedaFiltro === 'USD') {
        // Convertir a USD
        precioConvertido = v.moneda === 'USD' ? v.precio : v.precio / TIPO_CAMBIO_USD;
      } else {
        // Convertir a ARS
        precioConvertido = v.moneda === 'USD' ? v.precio * TIPO_CAMBIO_USD : v.precio;
      }

      if (precioConvertido > maxPrecio) {
        maxPrecio = precioConvertido;
      }
    }

    // Redondear hacia arriba para tener un número más limpio
    if (filters.monedaFiltro === 'USD') {
      return Math.ceil(maxPrecio / 1000) * 1000; // Redondear a miles de USD
    } else {
      return Math.ceil(maxPrecio / 1000000) * 1000000; // Redondear a millones de ARS
    }
  }, [vehicles, filters.monedaFiltro]);

  // Sincronizar precioMax del filtro con el precio máximo del catálogo
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (vehicles.length > 0 && !initialized) {
      setFilters(prev => ({ ...prev, precioMax: precioMaxCatalogo }));
      setInitialized(true);
    }
  }, [vehicles.length, precioMaxCatalogo, initialized]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (filters.search && !`${v.marca} ${v.modelo}`.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.tipoVehiculo && v.tipoVehiculo !== filters.tipoVehiculo) return false;
      if (filters.marca && v.marca !== filters.marca) return false;
      if (filters.tipo && v.tipo !== filters.tipo) return false;
      if (filters.transmision && v.transmision !== filters.transmision) return false;
      if (filters.combustible && v.combustible !== filters.combustible) return false;

      // Filtro de precio con conversión de moneda
      if (v.precio !== null) {
        // Convertir el precio del vehículo a la moneda del filtro
        let precioConvertido: number;

        if (filters.monedaFiltro === 'USD') {
          // El filtro está en USD, convertir precio del vehículo a USD
          if (v.moneda === 'USD') {
            precioConvertido = v.precio;
          } else {
            // ARS a USD
            precioConvertido = v.precio / TIPO_CAMBIO_USD;
          }
        } else {
          // El filtro está en ARS, convertir precio del vehículo a ARS
          if (v.moneda === 'ARS' || !v.moneda) {
            precioConvertido = v.precio;
          } else {
            // USD a ARS
            precioConvertido = v.precio * TIPO_CAMBIO_USD;
          }
        }

        if (precioConvertido < filters.precioMin || precioConvertido > filters.precioMax) return false;
      }

      if (v.anio < filters.anioMin || v.anio > filters.anioMax) return false;

      // Filtro de kilometraje
      if (v.kilometraje !== null && v.kilometraje !== undefined) {
        if (v.kilometraje < filters.kilometrajeMin || v.kilometraje > filters.kilometrajeMax) return false;
      }

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

        <div className="container mx-auto px-4 -mt-16 relative z-20">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card border-4 border-background overflow-hidden flex items-center justify-center shadow-xl z-10">
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
                precioMaxCatalogo={precioMaxCatalogo}
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
                  precioMaxCatalogo={precioMaxCatalogo}
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
