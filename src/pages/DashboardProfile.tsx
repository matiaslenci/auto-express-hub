import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateAgency } from '@/hooks/useAgency';
import { useUploadAgencyLogo, useUploadAgencyCover } from '@/hooks/useUpload';
import { PLAN_NAMES, PLAN_PRICES, WHATSAPP_SUPPORT } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, MapPin, Phone, Image, ExternalLink, Upload, X, Crown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { SEO } from '@/components/common/SEO';

export default function DashboardProfile() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const updateAgencyMutation = useUpdateAgency();
  const { uploadAsync: uploadLogo, isUploading: isUploadingLogo } = useUploadAgencyLogo();
  const { uploadAsync: uploadCover, isUploading: isUploadingCover } = useUploadAgencyCover();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

    try {
      await updateAgencyMutation.mutateAsync(formData);
      await refreshUser();
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadLogo(file);
      updateField('logo', response.url);
      toast({ title: 'Logo subido correctamente' });
    } catch (error: any) {
      toast({
        title: 'Error al subir logo',
        description: error.message || 'No se pudo subir el logo.',
        variant: 'destructive',
      });
    }

    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadCover(file);
      updateField('portada', response.url);
      toast({ title: 'Portada subida correctamente' });
    } catch (error: any) {
      toast({
        title: 'Error al subir portada',
        description: error.message || 'No se pudo subir la portada.',
        variant: 'destructive',
      });
    }

    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const planClass = user?.plan === 'premium' ? 'badge-premium' :
    user?.plan === 'profesional' ? 'badge-profesional' : 'badge-basico';

  return (
    <DashboardLayout>
      <SEO title="Mi Perfil | AgenciaExpress" description="Administra la información de tu agencia." />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="dashboard-page-header">
          <h1>Perfil de la agencia</h1>
          <p>Personaliza cómo se ve tu catálogo</p>
        </div>

        {/* Preview Card */}
        <div className="glass-card overflow-hidden mb-8 animate-fade-in-up">
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
              <div className="w-20 z-30 h-20 rounded-xl bg-card border-4 border-card overflow-hidden flex items-center justify-center">
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
          <div className="form-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title">
              <User />
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
                    placeholder="Buenos Aires, CABA"
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
                    placeholder="5491112345678"
                    className="input-glow"
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluye código de país sin + (ej: 549 para Argentina)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-title">
              <Image />
              Imágenes
            </h2>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>Logo de la agencia</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted border overflow-hidden flex items-center justify-center">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="gap-2"
                    >
                      {isUploadingLogo ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Subir logo</>
                      )}
                    </Button>
                    {formData.logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField('logo', '')}
                        className="gap-2 text-destructive"
                      >
                        <X className="h-4 w-4" /> Eliminar
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recomendado: imagen cuadrada de al menos 200x200px (JPG, PNG, WebP)
                </p>
              </div>

              {/* Cover Upload */}
              <div className="space-y-3">
                <Label>Imagen de portada</Label>
                <div className="space-y-3">
                  <div className="w-full h-32 rounded-xl bg-muted border overflow-hidden">
                    {formData.portada ? (
                      <img src={formData.portada} alt="Portada" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverUpload}
                      className="hidden"
                      id="cover-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="gap-2"
                    >
                      {isUploadingCover ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Subir portada</>
                      )}
                    </Button>
                    {formData.portada && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField('portada', '')}
                        className="gap-2 text-destructive"
                      >
                        <X className="h-4 w-4" /> Eliminar
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1200x400px o proporción similar (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
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

            {user?.plan !== 'premium' && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu plan para publicar más vehículos y llegar a más clientes.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const message = encodeURIComponent(
                      `Hola! Me gustaría actualizar mi plan de AgenciaExpress. Actualmente tengo el plan ${PLAN_NAMES[user?.plan || 'basico']} y me gustaría conocer las opciones disponibles.`
                    );
                    window.open(`https://wa.me/${WHATSAPP_SUPPORT.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Cambiar de plan
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href={`/${user?.username}`}
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
              disabled={updateAgencyMutation.isPending}
            >
              {updateAgencyMutation.isPending ? (
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
