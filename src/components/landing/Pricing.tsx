import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Básico',
    price: 29,
    description: 'Perfecto para empezar',
    features: [
      '10 publicaciones activas',
      'URL personalizada',
      'Estadísticas básicas',
      'Integración WhatsApp',
      'Soporte por email',
    ],
    popular: false,
    plan: 'basico' as const,
  },
  {
    name: 'Profesional',
    price: 79,
    description: 'Para agencias en crecimiento',
    features: [
      '50 publicaciones activas',
      'URL personalizada',
      'Estadísticas avanzadas',
      'Integración WhatsApp',
      'Soporte prioritario',
      'Logo y portada personalizados',
    ],
    popular: true,
    plan: 'profesional' as const,
  },
  {
    name: 'Premium',
    price: 149,
    description: 'Sin límites para tu negocio',
    features: [
      'Publicaciones ilimitadas',
      'URL personalizada',
      'Estadísticas completas',
      'Integración WhatsApp',
      'Soporte 24/7',
      'Personalización total',
      'API de integración',
    ],
    popular: false,
    plan: 'premium' as const,
  },
];

export function Pricing() {
  return (
    <section className="py-24 relative" id="planes">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes que se adaptan a
            <span className="gradient-text"> tu negocio</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sin comisiones. Cancela cuando quieras.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 transition-all duration-300",
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 to-card border-2 border-primary shadow-[0_0_40px_rgba(249,115,22,0.15)] scale-105"
                  : "glass-card hover-lift"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={`/registro?plan=${plan.plan}`}>
                <Button
                  variant={plan.popular ? 'gradient' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  Comenzar ahora
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
