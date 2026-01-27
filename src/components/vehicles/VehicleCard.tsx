import { Link } from 'react-router-dom';
import { Vehicle } from '@/lib/storage';
import { MapPin, Gauge, Fuel, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  agencyUsername: string;
  className?: string;
}

// Helper para formatear precio según moneda
const formatVehiclePrice = (precio: number | null, moneda: string) => {
  if (moneda === 'CONSULTAR' || precio === null) {
    return 'Consultar precio';
  }

  const currency = moneda === 'USD' ? 'USD' : 'ARS';
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(precio);

  return moneda === 'USD' ? formatted.replace('US$', 'US$ ') : formatted;
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
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={vehicle.fotos[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop'}
          alt={`${vehicle.marca} ${vehicle.modelo}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Type Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 dark:bg-black/50 backdrop-blur-md text-xs font-medium text-white shadow-lg">
          {vehicle.tipo}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
              {vehicle.marca} {vehicle.modelo}
            </h3>
            <p className="text-sm text-muted-foreground">{vehicle.color}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{formattedPrice}</p>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{formattedKm} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="h-4 w-4" />
            <span>{vehicle.transmision}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span>{vehicle.combustible}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
