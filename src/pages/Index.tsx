import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

import { SEO } from '@/components/common/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AgenciaExpress - Gestión de Agencias de Vehículos"
        description="Plataforma líder para la gestión de inventario y ventas de agencias automotrices. Crea tu catálogo digital en minutos."
      />
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
