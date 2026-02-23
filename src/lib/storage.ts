// Storage utilities for Catálogo Vehículos
// Uses localStorage for data persistence

export interface Agency {
  id: string;
  username: string;
  email: string;
  password: string;
  nombre: string;
  logo: string;
  portada: string;
  ubicacion: string;
  whatsapp: string;
  plan: 'basico' | 'profesional' | 'premium';
  limitePublicaciones: number;
  createdAt: string;
}

export type Moneda = 'ARS' | 'USD' | 'CONSULTAR';

export interface Vehicle {
  id: string;
  agenciaUsername: string;
  marca: string;
  tipoVehiculo: 'AUTO' | 'MOTO';
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
  localidad?: string;
  fotos: string[];
  activo: boolean;
  vistas: number;
  clicksWhatsapp: number;
  createdAt: string;
}

const AGENCIES_KEY = 'agencia_express_agencies';
const VEHICLES_KEY = 'agencia_express_vehicles';
const CURRENT_USER_KEY = 'agencia_express_current_user';

// Plan limits
export const PLAN_LIMITS = {
  basico: 10,
  profesional: 50,
  premium: Infinity,
} as const;

// WhatsApp de soporte para upgrade de planes
export const WHATSAPP_SUPPORT = '+5493425765843';

export const PLAN_PRICES = {
  basico: 42000,
  profesional: 100000,
  premium: 160000,
} as const;

export const PLAN_NAMES = {
  basico: 'Básico',
  profesional: 'Profesional',
  premium: 'Premium',
} as const;

// Agency functions
export const getAgencies = (): Agency[] => {
  const data = localStorage.getItem(AGENCIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAgencies = (agencies: Agency[]): void => {
  localStorage.setItem(AGENCIES_KEY, JSON.stringify(agencies));
};

export const getAgencyByUsername = (username: string): Agency | undefined => {
  return getAgencies().find(a => a.username.toLowerCase() === username.toLowerCase());
};

export const getAgencyByEmail = (email: string): Agency | undefined => {
  return getAgencies().find(a => a.email.toLowerCase() === email.toLowerCase());
};

export const createAgency = (agency: Omit<Agency, 'id' | 'createdAt'>): Agency => {
  const agencies = getAgencies();
  const newAgency: Agency = {
    ...agency,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  agencies.push(newAgency);
  saveAgencies(agencies);
  return newAgency;
};

export const updateAgency = (username: string, updates: Partial<Agency>): Agency | undefined => {
  const agencies = getAgencies();
  const index = agencies.findIndex(a => a.username === username);
  if (index === -1) return undefined;

  agencies[index] = { ...agencies[index], ...updates };
  saveAgencies(agencies);
  return agencies[index];
};

// Vehicle functions
export const getVehicles = (): Vehicle[] => {
  const data = localStorage.getItem(VEHICLES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveVehicles = (vehicles: Vehicle[]): void => {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
};

export const getVehiclesByAgency = (agenciaUsername: string): Vehicle[] => {
  return getVehicles().filter(v => v.agenciaUsername === agenciaUsername);
};

export const getActiveVehiclesByAgency = (agenciaUsername: string): Vehicle[] => {
  return getVehicles().filter(v => v.agenciaUsername === agenciaUsername && v.activo);
};

export const getVehicleById = (id: string): Vehicle | undefined => {
  return getVehicles().find(v => v.id === id);
};

export const createVehicle = (vehicle: Omit<Vehicle, 'id' | 'vistas' | 'clicksWhatsapp' | 'createdAt'>): Vehicle => {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: crypto.randomUUID(),
    vistas: 0,
    clicksWhatsapp: 0,
    createdAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  saveVehicles(vehicles);
  return newVehicle;
};

export const updateVehicle = (id: string, updates: Partial<Vehicle>): Vehicle | undefined => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return undefined;

  vehicles[index] = { ...vehicles[index], ...updates };
  saveVehicles(vehicles);
  return vehicles[index];
};

export const deleteVehicle = (id: string): boolean => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return false;

  vehicles.splice(index, 1);
  saveVehicles(vehicles);
  return true;
};

export const incrementVehicleViews = (id: string): void => {
  const vehicle = getVehicleById(id);
  if (vehicle) {
    updateVehicle(id, { vistas: vehicle.vistas + 1 });
  }
};

export const incrementVehicleWhatsappClicks = (id: string): void => {
  const vehicle = getVehicleById(id);
  if (vehicle) {
    updateVehicle(id, { clicksWhatsapp: vehicle.clicksWhatsapp + 1 });
  }
};

// Auth functions
export const getCurrentUser = (): Agency | null => {
  const username = localStorage.getItem(CURRENT_USER_KEY);
  if (!username) return null;
  return getAgencyByUsername(username) || null;
};

export const setCurrentUser = (username: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, username);
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const login = (email: string, password: string): Agency | null => {
  const agency = getAgencyByEmail(email);
  if (agency && agency.password === password) {
    setCurrentUser(agency.username);
    return agency;
  }
  return null;
};

export const logout = (): void => {
  clearCurrentUser();
};


