// Storage utilities for Agencia Express
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

export interface Vehicle {
  id: string;
  agenciaUsername: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  tipo: string;
  transmision: string;
  combustible: string;
  kilometraje: number;
  color: string;
  descripcion: string;
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

export const PLAN_PRICES = {
  basico: 29,
  profesional: 79,
  premium: 149,
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

// Seed demo data
export const seedDemoData = (): void => {
  const agencies = getAgencies();
  if (agencies.length > 0) return;

  // Create demo agency
  const demoAgency = createAgency({
    username: 'autosdeluxe',
    email: 'demo@autosdeluxe.com',
    password: 'demo1234',
    nombre: 'Autos DeLuxe',
    logo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=100&h=100&fit=crop',
    portada: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop',
    ubicacion: 'Ciudad de México, CDMX',
    whatsapp: '5215512345678',
    plan: 'profesional',
    limitePublicaciones: PLAN_LIMITS.profesional,
  });

  // Create demo vehicles
  const demoVehicles = [
    {
      marca: 'BMW',
      modelo: 'Serie 3',
      año: 2023,
      precio: 850000,
      tipo: 'Sedán',
      transmision: 'Automática',
      combustible: 'Gasolina',
      kilometraje: 15000,
      color: 'Blanco',
      descripcion: 'BMW Serie 3 en excelentes condiciones, único dueño, mantenimiento de agencia.',
      fotos: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop',
      ],
    },
    {
      marca: 'Mercedes-Benz',
      modelo: 'GLC 300',
      año: 2022,
      precio: 920000,
      tipo: 'SUV',
      transmision: 'Automática',
      combustible: 'Gasolina',
      kilometraje: 25000,
      color: 'Negro',
      descripcion: 'Mercedes GLC 300 AMG Line, interiores de piel, techo panorámico.',
      fotos: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
      ],
    },
    {
      marca: 'Toyota',
      modelo: 'RAV4',
      año: 2023,
      precio: 580000,
      tipo: 'SUV',
      transmision: 'Automática',
      combustible: 'Híbrido',
      kilometraje: 8000,
      color: 'Gris',
      descripcion: 'Toyota RAV4 Híbrida XLE, excelente rendimiento de combustible.',
      fotos: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      ],
    },
    {
      marca: 'Ford',
      modelo: 'Mustang',
      año: 2021,
      precio: 780000,
      tipo: 'Coupé',
      transmision: 'Manual',
      combustible: 'Gasolina',
      kilometraje: 32000,
      color: 'Rojo',
      descripcion: 'Ford Mustang GT Premium, motor V8 5.0L, sonido impresionante.',
      fotos: [
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&h=600&fit=crop',
      ],
    },
  ];

  demoVehicles.forEach((v, i) => {
    createVehicle({
      ...v,
      agenciaUsername: demoAgency.username,
      activo: true,
    });
  });
};

// Initialize
seedDemoData();
