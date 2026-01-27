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
  añoMin: number;
  añoMax: number;
  search: string;
}

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
      precioMax: 5000000,
      añoMin: 2000,
      añoMax: currentYear,
      search: '',
    });
  };

  const hasActiveFilters = filters.marca || filters.tipo || filters.transmision ||
    filters.combustible || filters.precioMin > 0 || filters.precioMax < 5000000 ||
    filters.añoMin > 2000 || filters.añoMax < currentYear || filters.search;

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
          <div className="flex items-center justify-between">
            <Label>Precio</Label>
            <span className="text-sm text-muted-foreground">
              ${filters.precioMin.toLocaleString()} - ${filters.precioMax.toLocaleString()}
            </span>
          </div>
          <div className="px-2">
            <Slider
              value={[filters.precioMin, filters.precioMax]}
              min={0}
              max={5000000}
              step={50000}
              onValueChange={([min, max]) => {
                updateFilter('precioMin', min);
                updateFilter('precioMax', max);
              }}
            />
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Año</Label>
            <span className="text-sm text-muted-foreground">
              {filters.añoMin} - {filters.añoMax}
            </span>
          </div>
          <div className="px-2">
            <Slider
              value={[filters.añoMin, filters.añoMax]}
              min={2000}
              max={currentYear}
              step={1}
              onValueChange={([min, max]) => {
                updateFilter('añoMin', min);
                updateFilter('añoMax', max);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
