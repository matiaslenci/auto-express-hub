import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useVehicle, useTrackView, useTrackWhatsAppClick } from '@/hooks/useVehicles';
import { useAgency } from '@/hooks/useAgency';
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Gauge,
  Fuel,
  Settings2,
  Calendar,
  Palette,
  Car,
  Bike,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2
} from 'lucide-react';
import { cn, buildImageUrl } from '@/lib/utils';

export default function VehicleDetail() {
  const { username, vehicleId } = useParams<{ username: string; vehicleId: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(vehicleId || '');
  const { data: agency, isLoading: agencyLoading } = useAgency(username || '');
  const trackViewMutation = useTrackView();
  const trackWhatsAppMutation = useTrackWhatsAppClick();

  // Track view on mount
  useEffect(() => {
    if (vehicleId && vehicle) {
      trackViewMutation.mutate(vehicleId);
    }
  }, [vehicleId, vehicle]);

  // Handle keyboard navigation for the image viewer
  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsViewerOpen(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling behind the modal
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isViewerOpen, currentImageIndex]);

  if (vehicleLoading || agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vehicle || !agency) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Vehículo no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Este vehículo no existe o ya no está disponible
            </p>
            <Link to={`/${username}`}>
              <Button variant="gradient">Ver otros vehículos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
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

  const formattedPrice = formatVehiclePrice(vehicle.precio, vehicle.moneda || 'ARS');

  const formattedKm = new Intl.NumberFormat('es-AR').format(vehicle.kilometraje);

  const images = vehicle.fotos;

  const handleWhatsAppClick = () => {
    if (vehicle && agency && agency.whatsapp && /^\d+$/.test(agency.whatsapp)) {
      trackWhatsAppMutation.mutate(vehicle.id);
      const message = encodeURIComponent(
        `Hola, me interesa el ${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}. ¿Está disponible?`
      );
      window.open(`https://wa.me/${agency.whatsapp}?text=${message}`, '_blank');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const specs = [
    { icon: Calendar, label: 'Año', value: vehicle.anio },
    { icon: Gauge, label: 'Kilometraje', value: `${formattedKm} km` },
    { icon: Settings2, label: 'Transmisión', value: vehicle.transmision },
    { icon: Fuel, label: 'Combustible', value: vehicle.combustible },
    { icon: Car, label: 'Tipo', value: vehicle.tipo },
    { icon: Palette, label: 'Color', value: vehicle.color },
    ...(vehicle.localidad ? [{ icon: MapPin, label: 'Ubicación', value: vehicle.localidad }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to={`/${username}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div
                className={cn(
                  "relative aspect-[4/3] rounded-2xl overflow-hidden glass-card bg-black/90 group",
                  images.length > 0 && "cursor-zoom-in"
                )}
                onClick={() => images.length > 0 && setIsViewerOpen(true)}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={buildImageUrl('vehicles', images[currentImageIndex])}
                      alt={`${vehicle.marca} ${vehicle.modelo}`}
                      className="w-full h-full object-contain transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-5 w-5" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                    {vehicle.tipoVehiculo === 'MOTO' ? (
                      <Bike className="h-32 w-32" strokeWidth={1} />
                    ) : (
                      <Car className="h-32 w-32" strokeWidth={1} />
                    )}
                    <span className="text-sm uppercase tracking-widest mt-4 font-medium opacity-50">Sin fotos disponibles</span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                        currentImageIndex === index
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={buildImageUrl('vehicles', img)}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {/*    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {vehicle.tipoVehiculo === 'MOTO' ? '🏍️ Moto' : '🚗 Auto'}
                  </span> */}
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {vehicle.tipo}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                    {vehicle.anio}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {vehicle.marca} {vehicle.modelo}
                </h1>
                <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
              </div>

              {/* WhatsApp CTA */}
              {agency.whatsapp && (
                <Button
                  variant="whatsapp"
                  size="xl"
                  className="w-full gap-3"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="h-6 w-6" />
                  Consultar por WhatsApp
                </Button>
              )}

              {/* Specs Grid */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Especificaciones</h2>
                <div className="grid grid-cols-2 gap-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <spec.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{spec.label}</p>
                        <p className="font-semibold">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {vehicle.descripcion && (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold mb-3">Descripción</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {vehicle.descripcion}
                  </p>
                </div>
              )}

              {/* Agency Info */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                    {agency.logo ? (
                      <img src={buildImageUrl('agencies', agency.logo)} alt={agency.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{agency.nombre}</h3>
                    {agency.ubicacion && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{agency.ubicacion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer Modal */}
      {isViewerOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <button
            onClick={() => setIsViewerOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={buildImageUrl('vehicles', images[currentImageIndex])}
            alt={`${vehicle.marca} ${vehicle.modelo} fullscreen`}
            className="w-full h-full max-w-[90vw] max-h-[90vh] object-contain select-none"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
