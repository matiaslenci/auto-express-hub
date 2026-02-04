import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VehicleFiltersState {
  marca: string;
  tipo: string;
  transmision: string;
  combustible: string;
  precioMin: number;
  precioMax: number;
  monedaFiltro: 'ARS' | 'USD';
  anioMin: number;
  anioMax: number;
  search: string;
}

// Tipo de cambio: 1 USD = 1465 ARS
const TIPO_CAMBIO_USD = 1465;

interface VehicleFiltersProps {
  filters: VehicleFiltersState;
  onFiltersChange: (filters: VehicleFiltersState) => void;
  marcas: string[];
}

const TIPOS = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Coupé', 'Van'];
const TRANSMISIONES = ['Manual', 'Automática'];
const COMBUSTIBLES = ['Nafta', 'Diésel', 'Gas', 'Híbrido', 'Eléctrico'];

const currentYear = new Date().getFullYear();

export function VehicleFilters({ filters, onFiltersChange, marcas }: VehicleFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = <K extends keyof VehicleFiltersState>(key: K, value: VehicleFiltersState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      marca: '',
      tipo: '',
      transmision: '',
      combustible: '',
      precioMin: 0,
      precioMax: filters.monedaFiltro === 'USD' ? 50000 : 50000000,
      monedaFiltro: filters.monedaFiltro,
      anioMin: 2000,
      anioMax: currentYear,
      search: '',
    });
  };

  // Cambiar moneda del filtro y convertir valores actuales
  const handleMonedaChange = (nuevaMoneda: 'ARS' | 'USD') => {
    if (nuevaMoneda === filters.monedaFiltro) return;

    let newMin: number;
    let newMax: number;

    if (nuevaMoneda === 'USD') {
      // Convertir de ARS a USD
      newMin = Math.round(filters.precioMin / TIPO_CAMBIO_USD);
      newMax = Math.round(filters.precioMax / TIPO_CAMBIO_USD);
    } else {
      // Convertir de USD a ARS
      newMin = filters.precioMin * TIPO_CAMBIO_USD;
      newMax = filters.precioMax * TIPO_CAMBIO_USD;
    }

    onFiltersChange({
      ...filters,
      monedaFiltro: nuevaMoneda,
      precioMin: newMin,
      precioMax: newMax,
    });
  };

  // Valores máximos del slider según la moneda
  const maxPrecio = filters.monedaFiltro === 'USD' ? 50000 : 50000000;
  const stepPrecio = filters.monedaFiltro === 'USD' ? 500 : 500000;

  const hasActiveFilters = filters.marca || filters.tipo || filters.transmision ||
    filters.combustible || filters.precioMin > 0 || filters.precioMax < maxPrecio ||
    filters.anioMin > 2000 || filters.anioMax < currentYear || filters.search;

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Filtros</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={cn("space-y-6", !isExpanded && "hidden lg:block")}>
        {/* Search */}
        <div className="space-y-2">
          <Label>Buscar</Label>
          <Input
            placeholder="Marca, modelo..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="input-glow"
          />
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label>Marca</Label>
          <Select value={filters.marca || "all"} onValueChange={(v) => updateFilter('marca', v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {marcas.map((marca) => (
                <SelectItem key={marca} value={marca}>{marca}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={filters.tipo || "all"} onValueChange={(v) => updateFilter('tipo', v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {TIPOS.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmisión */}
        <div className="space-y-2">
          <Label>Transmisión</Label>
          <Select value={filters.transmision || "all"} onValueChange={(v) => updateFilter('transmision', v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Cualquier transmisión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier transmisión</SelectItem>
              {TRANSMISIONES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Combustible */}
        <div className="space-y-2">
          <Label>Combustible</Label>
          <Select value={filters.combustible || "all"} onValueChange={(v) => updateFilter('combustible', v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Cualquier combustible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier combustible</SelectItem>
              {COMBUSTIBLES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          {/* Currency Toggle */}
          <div className="flex items-center gap-2">
            <Label className="flex-shrink-0">Moneda:</Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => handleMonedaChange('ARS')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  filters.monedaFiltro === 'ARS'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground"
                )}
              >
                $ ARS
              </button>
              <button
                type="button"
                onClick={() => handleMonedaChange('USD')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  filters.monedaFiltro === 'USD'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground"
                )}
              >
                US$ USD
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Precio</Label>
            <span className="text-sm text-muted-foreground">
              {filters.monedaFiltro === 'USD' ? 'US$' : '$'}{filters.precioMin.toLocaleString()} - {filters.monedaFiltro === 'USD' ? 'US$' : '$'}{filters.precioMax.toLocaleString()}
            </span>
          </div>
          <div className="px-2">
            <Slider
              value={[filters.precioMin, filters.precioMax]}
              min={0}
              max={maxPrecio}
              step={stepPrecio}
              onValueChange={([min, max]) => {
                updateFilter('precioMin', min);
                updateFilter('precioMax', max);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Cotización: 1 USD = ${TIPO_CAMBIO_USD.toLocaleString()} ARS
          </p>
        </div>

        {/* Year Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Año</Label>
            <span className="text-sm text-muted-foreground">
              {filters.anioMin} - {filters.anioMax}
            </span>
          </div>
          <div className="px-2">
            <Slider
              value={[filters.anioMin, filters.anioMax]}
              min={2000}
              max={currentYear}
              step={1}
              onValueChange={([min, max]) => {
                updateFilter('anioMin', min);
                updateFilter('anioMax', max);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
