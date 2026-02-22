import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">
              Agencia<span className="text-primary">Express</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#planes" className="hover:text-foreground transition-colors">
              Planes
            </a>
            <Link to="/autosdeluxe" className="hover:text-foreground transition-colors">
              Demo
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Iniciar sesión
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgenciaExpress. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
