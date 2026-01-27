import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCreateVehicle, useVehicles } from '@/hooks/useVehicles';
import { useUploadVehicleImage } from '@/hooks/useUpload';
import { PLAN_LIMITS } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon, Upload } from 'lucide-react';

const TIPOS = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Coupé', 'Van'];
const TRANSMISIONES = ['Manual', 'Automática'];
const COMBUSTIBLES = ['Nafta', 'Diésel', 'Gas', 'Híbrido', 'Eléctrico'];
const COLORES = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Otro'];
const MONEDAS = [
  { value: 'ARS', label: 'Pesos argentinos ($)' },
  { value: 'USD', label: 'Dólares (US$)' },
  { value: 'CONSULTAR', label: 'Sin precio - Consultar' },
];
const MARCAS = [
  'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia',
  'Mazda', 'Mercedes-Benz', 'Nissan', 'Toyota', 'Volkswagen', 'Otro'
];

import { SEO } from '@/components/common/SEO';

export default function DashboardNewVehicle() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const createVehicleMutation = useCreateVehicle();
  const { data: vehicles } = useVehicles({ agenciaUsername: user?.username });
  const { uploadAsync, isUploading } = useUploadVehicleImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precio: null as number | null,
    moneda: 'ARS' as 'ARS' | 'USD' | 'CONSULTAR',
    tipo: '',
    transmision: '',
    combustible: '',
    kilometraje: 0,
    color: '',
    descripcion: '',
    fotos: [] as string[],
  });

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

  // Check plan limits
  const activeVehicles = vehicles?.filter(v => v.activo) || [];
  const limit = PLAN_LIMITS[user?.plan || 'basico'];
  const canAddMore = limit === Infinity || activeVehicles.length < limit;

  if (!canAddMore) {
    toast({
      title: 'Límite alcanzado',
      description: 'Has alcanzado el límite de publicaciones de tu plan.',
      variant: 'destructive',
    });
    navigate('/dashboard/vehiculos');
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (formData.fotos.length >= 10) {
        toast({
          title: 'Límite alcanzado',
          description: 'Máximo 10 fotos por vehículo.',
          variant: 'destructive',
        });
        break;
      }

      try {
        const response = await uploadAsync(file);
        setFormData(prev => ({ ...prev, fotos: [...prev.fotos, response.url] }));
      } catch (error: any) {
        toast({
          title: 'Error al subir imagen',
          description: error.message || 'No se pudo subir la imagen.',
          variant: 'destructive',
        });
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createVehicleMutation.mutateAsync({
        ...formData,
        activo: true,
      });

      toast({
        title: '¡Vehículo creado!',
        description: 'El vehículo ha sido agregado a tu catálogo.',
      });

      navigate('/dashboard/vehiculos');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el vehículo.',
        variant: 'destructive',
      });
    }
  };



  return (
    <DashboardLayout>
      <SEO title="Nuevo Vehículo | AgenciaExpress" description="Publica un nuevo vehículo en tu catálogo." />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Nuevo vehículo</h1>
            <p className="text-muted-foreground">Agrega un vehículo a tu catálogo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold">Información básica</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Select value={formData.marca} onValueChange={(v) => updateField('marca', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARCAS.map((marca) => (
                      <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  placeholder="Ej: Camry, Civic, Serie 3"
                  value={formData.modelo}
                  onChange={(e) => updateField('modelo', e.target.value)}
                  required
                  className="input-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anio">Año *</Label>
                <Input
                  id="anio"
                  type="number"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={formData.anio}
                  onChange={(e) => updateField('anio', parseInt(e.target.value))}
                  required
                  className="input-glow"
                />
              </div>

              <div className="space-y-2">
                <Label>Moneda *</Label>
                <Select value={formData.moneda} onValueChange={(v: 'ARS' | 'USD' | 'CONSULTAR') => {
                  updateField('moneda', v);
                  if (v === 'CONSULTAR') {
                    updateField('precio', null);
                  }
                }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.moneda !== 'CONSULTAR' && (
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio ({formData.moneda === 'USD' ? 'USD' : 'ARS'}) *</Label>
                  <Input
                    id="precio"
                    type="number"
                    min={0}
                    value={formData.precio || ''}
                    onChange={(e) => updateField('precio', parseInt(e.target.value) || 0)}
                    required
                    className="input-glow"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold">Especificaciones</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => updateField('tipo', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transmisión *</Label>
                <Select value={formData.transmision} onValueChange={(v) => updateField('transmision', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona transmisión" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISIONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Combustible *</Label>
                <Select value={formData.combustible} onValueChange={(v) => updateField('combustible', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona combustible" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMBUSTIBLES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color *</Label>
                <Select value={formData.color} onValueChange={(v) => updateField('color', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="kilometraje">Kilometraje</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  min={0}
                  value={formData.kilometraje || ''}
                  onChange={(e) => updateField('kilometraje', parseInt(e.target.value) || 0)}
                  className="input-glow"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Descripción</h2>
            <Textarea
              placeholder="Describe el vehículo, características especiales, historial de servicio, etc."
              value={formData.descripcion}
              onChange={(e) => updateField('descripcion', e.target.value)}
              rows={4}
              className="input-glow resize-none"
            />
          </div>

          {/* Photos */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Fotos</h2>
            <p className="text-sm text-muted-foreground">
              Sube fotos del vehículo (máximo 10, formatos: JPG, PNG, WebP)
            </p>

            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || formData.fotos.length >= 10}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Subir fotos
                  </>
                )}
              </Button>
            </div>

            {/* Photo Grid */}
            {formData.fotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.fotos.map((foto, index) => (
                  <div key={index} className="relative group aspect-video rounded-lg overflow-hidden">
                    <img
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Aún no hay fotos</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={createVehicleMutation.isPending}
            >
              {createVehicleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Publicar vehículo'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
