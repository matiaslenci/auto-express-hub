import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Car, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PLAN_PRICES, PLAN_LIMITS } from '@/lib/storage';

const plans = [
  { id: 'gratuito', name: 'Gratuito', price: PLAN_PRICES.gratuito, limit: PLAN_LIMITS.gratuito },
  { id: 'basico', name: 'Básico', price: PLAN_PRICES.basico, limit: PLAN_LIMITS.basico },
  { id: 'profesional', name: 'Profesional', price: PLAN_PRICES.profesional, limit: PLAN_LIMITS.profesional },
  { id: 'premium', name: 'Premium', price: PLAN_PRICES.premium, limit: 'Ilimitadas' },
] as const;

import { SEO } from '@/components/common/SEO';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function Register() {
  const { register, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    email: '',
    password: '',
    plan: 'gratuito' as 'gratuito' | 'basico' | 'profesional' | 'premium',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(formData.password)) {
      toast({
        title: 'Contraseña inválida',
        description: 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)',
        variant: 'destructive',
      });
      return;
    }

    const result = await register(formData);

    if (result.success) {
      toast({
        title: "¡Cuenta creada!",
        description: "Bienvenido a CatálogoVehículos.",
      });
      navigate('/dashboard/perfil');
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      <SEO
        title="Registrar Agencia - CatálogoVehículos"
        description="Crea tu cuenta en CatálogoVehículos y comienza a gestionar tu inventario de vehículos hoy mismo."
      />
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 rounded-xl bg-primary/10">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold">
            Catálogo<span className="text-primary">Vehículos</span>
          </span>
        </Link>

        {/* Form Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Crea tu agencia</h1>
            <p className="text-muted-foreground">Comienza a vender más en minutos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-3">
              <Label>Selecciona tu plan</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => updateField('plan', plan.id)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      formData.plan === plan.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {formData.plan === plan.id && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <p className="font-semibold text-sm">{plan.name}</p>
                    <p className="text-lg font-bold text-primary">{plan.price === 0 ? 'Gratis' : `$${plan.price}`}</p>
                    <p className="text-xs text-muted-foreground">{plan.limit} pub.</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Agency Name */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la agencia</Label>
              <Input
                id="nombre"
                placeholder="Mi Agencia Automotriz"
                value={formData.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                required
                className="input-glow"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario (URL)</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">catalogovehiculos.com/</span>
                <Input
                  id="username"
                  placeholder="miagencia"
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  required
                  className="input-glow"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="input-glow"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={8}
                  className="input-glow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)
              </p>
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear mi agencia'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
