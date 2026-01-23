import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { updateAgency, PLAN_NAMES, PLAN_PRICES } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, MapPin, Phone, Image, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

import { SEO } from '@/components/common/SEO';

export default function DashboardProfile() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    logo: '',
    portada: '',
    ubicacion: '',
    whatsapp: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        logo: user.logo || '',
        portada: user.portada || '',
        ubicacion: user.ubicacion || '',
        whatsapp: user.whatsapp || '',
      });
    }
  }, [user]);

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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      updateAgency(user!.username, formData);
      refreshUser();
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  const planClass = user?.plan === 'premium' ? 'badge-premium' :
    user?.plan === 'profesional' ? 'badge-profesional' : 'badge-basico';

  return (
    <DashboardLayout>
      <SEO title="Mi Perfil | AgenciaExpress" description="Administra la información de tu agencia." />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Perfil de la agencia</h1>
          <p className="text-muted-foreground">Personaliza cómo se ve tu catálogo</p>
        </div>

        {/* Preview Card */}
        <div className="glass-card overflow-hidden mb-8">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/5">
            {formData.portada && (
              <img
                src={formData.portada}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-6 pt-0 -mt-8">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl bg-card border-4 border-card overflow-hidden flex items-center justify-center">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{formData.nombre || 'Tu Agencia'}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>@{user?.username}</span>
                  <span className={cn("badge-plan", planClass)}>
                    {PLAN_NAMES[user?.plan || 'basico']}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Información básica
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la agencia</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  placeholder="Mi Agencia Automotriz"
                  className="input-glow"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación
                  </Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => updateField('ubicacion', e.target.value)}
                    placeholder="Ciudad de México, CDMX"
                    className="input-glow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    <Phone className="h-4 w-4 inline mr-1" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="5215512345678"
                    className="input-glow"
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluye código de país sin + (ej: 521 para México)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Imágenes
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo (URL)</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => updateField('logo', e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="input-glow"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: imagen cuadrada de al menos 200x200px
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portada">Imagen de portada (URL)</Label>
                <Input
                  id="portada"
                  value={formData.portada}
                  onChange={(e) => updateField('portada', e.target.value)}
                  placeholder="https://ejemplo.com/portada.jpg"
                  className="input-glow"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1200x400px o proporción similar
                </p>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Tu plan actual</h2>
                <p className="text-muted-foreground">
                  {PLAN_NAMES[user?.plan || 'basico']} - ${PLAN_PRICES[user?.plan || 'basico']}/mes
                </p>
              </div>
              <span className={cn("badge-plan text-base px-4 py-2", planClass)}>
                {PLAN_NAMES[user?.plan || 'basico']}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href={`/@${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button type="button" variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver catálogo
              </Button>
            </a>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
