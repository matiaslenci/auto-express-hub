# Plan de Implementación Frontend: Analíticas

Este plan detalla los pasos para completar la integración del sistema de analíticas en el frontend (`auto-express-hub`), de manera que las agencias puedan ver y rastrear sus estadísticas directamente en la aplicación.

## 1. Captura de Eventos (Event Tracking)
Los eventos deben registrarse en el lado del cliente (público) utilizando `analyticsService`.

### a) Vistas de Vehículos (`VehicleDetail.tsx`)
- Detectar cuando un usuario ingresa al detalle completo de un vehículo.
- Lllamar a `analyticsService.trackView(vehicleId)` dentro de un `useEffect` al montar el componente.
- **Evitar re-ejecuciones múltiples**: Usar un timer o useRef para asegurar que sólo cuente 1 vista real por sesión, o simplemente dejar que React lo corra 1 vez (o el Rate Limit del backend filtre rápidos refresh).

### b) Clicks de WhatsApp (`ContactBox` o `VehicleDetail`)
- Localizar el botón de "Contactar por WhatsApp".
- En el manejador del `onClick`, antes o al mismo tiempo que redireccionar/abrir la URL de WhatsApp.
- Llamar a `analyticsService.trackWhatsAppClick(vehicleId)`.

## 2. Desarrollo del Dashboard (Vistas Privadas)

### a) Creación del Componente `AnalyticsDashboard.tsx`
Señalar ruta: `/dashboard/analytics`.
- **Estado (State):** 
  - `agencySummary` (totales y conversión global, top 5).
  - `isLoading`, `error`.
- **Efecto de carga (useEffect):**
  - Al montar, invocar `analyticsService.getAgencySummary()`.
- **Interfaz (UI):**
  1. **Cards (Tarjetas de métricas):**
     - Total de Vistas Globales.
     - Total de Clicks (WhatsApp) Globales.
     - Tasa de Conversión Global (Calculada como Clicks / Vistas * 100).
  2. **Tabla de Ranking:**
     - Listar los 5 vehículos más vistos que devuelve el servidor (`topVehicles`).
     - Columnas: Vehículo (Marca + Modelo), Visitas, Clicks en WhatsApp, % Conversión individual.
  3. *(Opcional / Fase 2)* **Gráfico de Líneas (Recharts o Chart.js):**
     - Podría agregarse un drill-down haciendo click en un auto de la tabla anterior que abra un modal llamando a `getVehicleStats(id)` para ese auto durante los últimos 30 días, y dibuje la curva.

### b) Navegación del Dashboard (`Sidebar.tsx`)
- Añadir un nuevo ítem en la barra de navegación lateral (`Sidebar`) del panel de control de la agencia.
- **Ruta:** `/dashboard/analytics`
- **Icono sugerido:** Un gráfico de barras o líneas (ej: `LineChart` o `BarChart` de lucide-react).

## 3. Integración en el Routing (`App.tsx` o Router respectivo)
- Importar `AnalyticsDashboard`.
- Incorporarlo como ruta hija (`Route`) dentro de la sección protegida (`/dashboard/*`).
- Asegurarse de que esté wrappeado con el layout correspondiente.

## 4. Aseguramiento de Autenticación
- El servicio `apiClient.ts` ya está configurado con un interceptor para inyectar automáticamente el Bearer token (JWT).
- Las llamadas a `analyticsService.getAgencySummary()` y `analyticsService.getVehicleStats()` se beneficiarán de esto, evitando errores 401 en el cliente mientras la sesión sea válida en el storage de React.
