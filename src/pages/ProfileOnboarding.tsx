import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateAgency } from '@/hooks/useAgency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Car, MapPin, Phone, Image, Loader2, ArrowRight, SkipForward } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

export default function ProfileOnboarding() {
    const { user, loading, isAuthenticated, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const updateAgencyMutation = useUpdateAgency();

    const [formData, setFormData] = useState({
        logo: '',
        portada: '',
        ubicacion: '',
        whatsapp: '',
    });

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateAgencyMutation.mutateAsync(formData);
            await refreshUser();

            toast({
                title: '¡Perfil completado!',
                description: 'Tu agencia está lista para empezar.',
            });

            navigate('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo actualizar el perfil.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
            <SEO
                title="Completa tu Perfil - AgenciaExpress"
                description="Personaliza tu agencia para comenzar a vender."
            />

            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Car className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold">
                        Agencia<span className="text-primary">Express</span>
                    </span>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {user?.nombre}!</h1>
                        <p className="text-muted-foreground">
                            Completa tu perfil para que tu catálogo se vea profesional
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Images Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <Image className="h-4 w-4" />
                                <span>Imágenes de tu agencia</span>
                            </div>

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
                                        Imagen cuadrada de al menos 200x200px
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

                        {/* Contact Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <Phone className="h-4 w-4" />
                                <span>Información de contacto</span>
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

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSkip}
                                className="flex-1 gap-2"
                            >
                                <SkipForward className="h-4 w-4" />
                                Saltar por ahora
                            </Button>
                            <Button
                                type="submit"
                                variant="gradient"
                                className="flex-1 gap-2"
                                disabled={updateAgencyMutation.isPending}
                            >
                                {updateAgencyMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        Completar perfil
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">
                            💡 <strong>Tip:</strong> Puedes editar esta información más tarde desde tu perfil
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
