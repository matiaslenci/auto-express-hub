# Design Doc: Sistema de Analíticas para Agencias

Este documento detalla la implementación del sistema de analíticas para la plataforma **CatálogoVehículos**, permitiendo a las agencias rastrear el rendimiento de su inventario.

## 1. Objetivos
- Proveer a las agencias datos precisos sobre el interés en sus vehículos.
- Visualizar tendencias de visualizaciones y contactos (WhatsApp).
- Identificar los vehículos con mayor rendimiento (conversión).

## 2. Implementación Backend (AnalyticsModule)

### Modelo de Datos (Entity: `VehicleAnalytics`)
Tabla centralizada para estadísticas diarias persistidas en base de datos.
- **Campos**:
  - `vehicleId` (UUID, FK a Vehicle)
  - `date` (Date, formato YYYY-MM-DD)
  - `viewsCount` (Integer, default 0)
  - `clicksCount` (Integer, default 0)
- **Clave Primaria**: Compuesta por `(vehicleId, date)`.

### Endpoints de API

#### Registro de Actividad (Públicos)
Utilizados por el catálogo público cada vez que ocurre una interacción.
- `POST /analytics/vehicle/:id/view`: Incrementa el contador de vistas para la fecha actual.
- `POST /analytics/vehicle/:id/whatsapp-click`: Incrementa el contador de clicks de WhatsApp para la fecha actual.

#### Consulta de Datos (Privados - JWT Required)
Utilizados por el Dashboard de la agencia.
- `GET /analytics/agency/summary`: 
  - Retorna: Top 5 vehículos, Total visitas agencias, Total clicks agencia, % de conversión.
- `GET /analytics/vehicle/:id/stats?days=30`:
  - Retorna: Arreglo de objetos `DailyStats` filtrado por el rango de días especificado.

## 3. Integración Frontend

### Captura de Datos
- **Vistas**: Se disparará el evento en el componente `VehicleDetail` al montar la página (con un pequeño debounce para evitar falsos positivos).
- **Clicks**: Se disparará al presionar el botón de "Contactar por WhatsApp".

### Visualización (Dashboard)
1. **Métricas Globales**: Cards con los totales y la tasa de conversión global.
2. **Gráfico de Líneas**: Implementado con una librería liviana (ej: Recharts) para mostrar la tendencia de los últimos 30 días.
3. **Tabla de Ranking**: Lista de los 5 autos más visitados con su respectiva tasa de conversión individual.

## 4. Consideraciones Técnicas
- **Rate Limiting**: Los endpoints de registro deben tener protección contra abusos (ej: múltiples hits desde la misma IP en segundos).
- **Sincronización**: Los contadores globales en la entidad `Vehicle` deben mantenerse en sincronía con la suma de las estadísticas diarias para consistencia.
