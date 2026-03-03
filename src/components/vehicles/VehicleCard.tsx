import { Link } from 'react-router-dom';
import { VehicleDto } from '@/api/types';
import { MapPin, Gauge, Fuel, Settings2, Car, Bike, Calendar } from 'lucide-react';
import { cn, resolveImageUrl } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: VehicleDto;
  agencyUsername: string;
  className?: string;
}

// Helper para formatear precio según moneda
const formatVehiclePrice = (precio: number | null, moneda: string) => {
  if (moneda === 'CONSULTAR' || precio === null) {
    return 'Consultar';
  }

  const currency = moneda === 'USD' ? 'USD' : 'ARS';
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(precio);

  return moneda === 'USD' ? formatted.replace('US$', 'US$') : formatted;
};

export function VehicleCard({ vehicle, agencyUsername, className }: VehicleCardProps) {
  const formattedPrice = formatVehiclePrice(vehicle.precio, vehicle.moneda || 'ARS');
  const formattedKm = new Intl.NumberFormat('es-AR').format(vehicle.kilometraje);

  return (
    <Link
      to={`/${agencyUsername}/${vehicle.id}`}
      className={cn("vehicle-card block group", className)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted flex items-center justify-center">
        {vehicle.fotos.length > 0 ? (
          <img
            src={resolveImageUrl(vehicle.fotos[0])}
            alt={`${vehicle.marca} ${vehicle.modelo}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/40 group-hover:scale-110 transition-transform duration-500">
            {vehicle.tipoVehiculo === 'MOTO' ? (
              <Bike className="h-16 w-16" strokeWidth={1.5} />
            ) : (
              <Car className="h-16 w-16" strokeWidth={1.5} />
            )}
            <span className="text-[10px] uppercase tracking-widest mt-2 font-medium">Sin fotos</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title + Price + Year */}
        <div className="mb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
            <div className="flex-1 min-w-0 pr-0 sm:pr-2">
              <h3 className="text-base font-bold leading-tight line-clamp-1" title={`${vehicle.marca} ${vehicle.modelo}`}>
                {vehicle.marca} {vehicle.modelo}
              </h3>
              <p className="text-lg font-bold text-primary mt-1 break-words sm:hidden">
                {formattedPrice}
              </p>
            </div>
            <div className="flex flex-row items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-1">
              <p className="text-lg font-bold text-primary break-words hidden sm:block">
                {formattedPrice}
              </p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap shrink-0">
                <Calendar className="h-3 w-3" />
                {vehicle.anio}
              </span>
            </div>
          </div>

          {/* Color + Location */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="truncate">{vehicle.color}</span>
            {vehicle.localidad && (
              <>
                <span className="shrink-0">·</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{vehicle.localidad}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Specs — 2 columns to avoid overflow */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Gauge className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{formattedKm} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Settings2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{vehicle.transmision}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Fuel className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{vehicle.combustible}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

