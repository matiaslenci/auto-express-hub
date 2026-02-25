// Constantes centralizadas de la aplicación
// Todas las opciones de vehículos y configuración en un solo lugar

// === Tipo de cambio ===
export const TIPO_CAMBIO_USD = 1465;

// === Marcas ===
export const MARCAS_AUTO = [
    "Toyota",
    "Volkswagen",
    "Fiat",
    "Renault",
    "Peugeot",
    "Ford",
    "Chevrolet",
    "Citroën",
    "Jeep",
    "Nissan",
    "BAIC",
    "Mercedes-Benz",
    "Hyundai",
    "Kia",
    "Honda",
    "Audi",
    "BMW",
    "Mitsubishi",
    "Subaru",
    "Land Rover",
    "Jaguar",
    "Volvo",
    "Suzuki",
    "Chery",
    "GWM",
    "Dodge",
    "Mini",
    "Tesla",
    "Jaguar Land Rover",
    "Otro"
];

export const MARCAS_MOTO = [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Kawasaki",
    "Bajaj",
    "Zanella",
    "Motomel",
    "Corven",
    "Gilera",
    "Beta",
    "Benelli",
    "Royal Enfield",
    "KTM",
    "Ducati",
    "Harley-Davidson",
    "BMW",
    "Triumph",
    "TVS",
    "CF Moto",
    "Kymco",
    "Voge",
    "Otro"
];

// === Tipos de vehículo ===
export const TIPOS_AUTO = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Coupé', 'Van'] as const;
export const TIPOS_MOTO = ['Street', 'Naked', 'Deportiva', 'Touring', 'Enduro', 'Cross', 'Custom', 'Scooter', 'Trail', 'Cuatrimoto'] as const;

// === Especificaciones ===
export const TRANSMISIONES = ['Manual', 'Automático'] as const;
export const COMBUSTIBLES = ['Nafta', 'Diésel', 'Gas', 'Híbrido', 'Eléctrico'] as const;
export const COLORES = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Otro'] as const;

// === Monedas ===
export const MONEDAS = [
    { value: 'ARS', label: 'Pesos argentinos ($)' },
    { value: 'USD', label: 'Dólares (US$)' },
    { value: 'CONSULTAR', label: 'Sin precio - Consultar' },
];

