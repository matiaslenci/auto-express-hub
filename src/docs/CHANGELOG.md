# Changelog - Últimos Cambios

**Fecha:** 27 de Enero 2026

---

## 🖼️ Sistema de Subida de Imágenes

### Nuevos Archivos

| Archivo | Descripción |
|---------|-------------|
| `src/api/services/upload.service.ts` | Servicio de API para subir imágenes |
| `src/hooks/useUpload.ts` | Hooks de React Query para manejar uploads |
| `src/pages/DashboardEditVehicle.tsx` | Nueva página para editar vehículos |

### Endpoints Implementados

```typescript
// Subir imagen de vehículo
POST /uploads/vehicle-image

// Subir logo de agencia
POST /uploads/agency-logo

// Subir portada de agencia
POST /uploads/agency-cover

// Eliminar imagen
DELETE /uploads/{folder}/{filename}
```

### Características
- Subida de archivos con `multipart/form-data`
- Token JWT incluido automáticamente
- Formatos soportados: JPG, PNG, WebP
- Máximo 10MB por archivo
- Conversión automática a WebP en el backend

---

## 💰 Campo Moneda en Vehículos

### Cambios en Tipos (`src/api/types.ts`)

```typescript
type Moneda = 'ARS' | 'USD' | 'CONSULTAR';

interface VehicleDto {
  // ...
  precio: number | null;  // Ahora nullable
  moneda: Moneda;         // Nuevo campo
  anio: number;           // Renombrado de "año"
}
```

### Lógica de Precio
- **ARS**: Muestra `$ X.XXX`
- **USD**: Muestra `US$ X.XXX`
- **CONSULTAR**: Muestra "Consultar precio" (precio = null)

### Archivos Modificados
- `VehicleCard.tsx` - Formato de precio
- `VehicleDetail.tsx` - Formato de precio
- `DashboardVehicles.tsx` - Lista de vehículos
- `DashboardNewVehicle.tsx` - Formulario con selector de moneda
- `AgencyCatalog.tsx` - Filtros de precio adaptados

---

## ⛽ Tipos de Combustible

### Cambio
```diff
- ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico']
+ ['Nafta', 'Diésel', 'Gas', 'Híbrido', 'Eléctrico']
```

### Archivos Modificados
- `DashboardNewVehicle.tsx`
- `VehicleFilters.tsx`
- `storage.ts` (datos demo)

---

## 📝 Página de Edición de Vehículos

### Nueva Ruta
```
/dashboard/vehiculos/:vehicleId/editar
```

### Características
- Carga datos del vehículo existente
- Mismo formulario que creación
- Subida de fotos con el nuevo sistema
- Validaciones

---

## 🔧 Corrección del Campo Año

### Problema
El backend rechazaba el campo `año` por el carácter especial `ñ`.

### Solución
Renombrado a `anio` en todos los DTOs y formularios.

```diff
- año: number;
+ anio: number;
```

---

## 📁 Estructura de Archivos Actualizada

```
src/
├── api/
│   ├── services/
│   │   ├── upload.service.ts    ← NUEVO
│   │   ├── vehicle.service.ts
│   │   └── agency.service.ts
│   └── types.ts                 ← MODIFICADO
├── hooks/
│   ├── useUpload.ts             ← NUEVO
│   └── useVehicles.ts
├── pages/
│   ├── DashboardEditVehicle.tsx ← NUEVO
│   ├── DashboardNewVehicle.tsx  ← MODIFICADO
│   └── DashboardProfile.tsx     ← MODIFICADO
└── components/
    └── vehicles/
        ├── VehicleCard.tsx      ← MODIFICADO
        └── VehicleFilters.tsx   ← MODIFICADO
```
