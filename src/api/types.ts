// API Response Types matching backend DTOs

// Authentication
export interface RegisterDto {
    email: string;
    password: string;
    username: string;
    nombre: string;
    plan: 'basico' | 'profesional' | 'premium';
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    agency: AgencyDto;
}

// Agency
export interface AgencyDto {
    id: string;
    username: string;
    email: string;
    nombre: string;
    logo?: string;
    portada?: string;
    ubicacion?: string;
    whatsapp?: string;
    plan: 'basico' | 'profesional' | 'premium';
    limitePublicaciones: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateAgencyDto {
    nombre?: string;
    logo?: string;
    portada?: string;
    ubicacion?: string;
    whatsapp?: string;
}

// Vehicle
export type Moneda = 'ARS' | 'USD' | 'CONSULTAR';

export interface VehicleDto {
    id: string;
    agenciaId: string;
    agenciaUsername: string;
    marca: string;
    modelo: string;
    anio: number;
    precio: number | null;
    moneda: Moneda;
    tipo: string;
    transmision: string;
    combustible: string;
    kilometraje: number;
    color: string;
    descripcion: string;
    localidad: string | null;
    fotos: string[];
    activo: boolean;
    vistas: number;
    clicksWhatsapp: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleDto {
    marca: string;
    modelo: string;
    anio: number;
    precio?: number | null;
    moneda: Moneda;
    tipo: string;
    transmision: string;
    combustible: string;
    kilometraje: number;
    color: string;
    descripcion: string;
    localidad?: string;
    fotos: string[];
    activo?: boolean;
}

export interface UpdateVehicleDto {
    marca?: string;
    modelo?: string;
    anio?: number;
    precio?: number | null;
    moneda?: Moneda;
    tipo?: string;
    transmision?: string;
    combustible?: string;
    kilometraje?: number;
    color?: string;
    descripcion?: string;
    localidad?: string;
    fotos?: string[];
    activo?: boolean;
}

export interface VehicleFilters {
    marca?: string;
    tipo?: string;
    precioMin?: number;
    precioMax?: number;
    anioMin?: number;
    anioMax?: number;
    transmision?: string;
    combustible?: string;
    agenciaUsername?: string;
}

// Error Response
export interface ApiError {
    message: string | string[];
    error?: string;
    statusCode: number;
}

// Pagination (if backend supports it)
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
