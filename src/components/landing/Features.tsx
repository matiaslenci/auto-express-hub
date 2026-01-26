import {
  Smartphone,
  BarChart3,
  MessageCircle,
  Palette,
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'URL Personalizada',
    description: 'Tu catálogo accesible desde agencia-express.com/tuagencia',
  },
  {
    icon: MessageCircle,
    title: 'Integración WhatsApp',
    description: 'Botón de contacto directo con mensaje pre-configurado',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas en tiempo real',
    description: 'Conoce las vistas y clicks de cada vehículo',
  },
  {
    icon: Palette,
    title: 'Diseño profesional',
    description: 'Catálogo moderno que impresiona a tus clientes',
  },
  {
    icon: Shield,
    title: 'Fácil de usar',
    description: 'Gestiona tu inventario sin conocimientos técnicos',
  },
  {
    icon: Zap,
    title: 'Rápido y eficiente',
    description: 'Publica vehículos en segundos, no minutos',
  },
];

export function Features() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas para
            <span className="gradient-text"> vender más</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Herramientas diseñadas específicamente para agencias automotrices que quieren destacar
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
