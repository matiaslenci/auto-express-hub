import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardVehicles from "./pages/DashboardVehicles";
import DashboardNewVehicle from "./pages/DashboardNewVehicle";
import DashboardEditVehicle from "./pages/DashboardEditVehicle";
import DashboardProfile from "./pages/DashboardProfile";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import AgencyCatalog from "./pages/AgencyCatalog";
import VehicleDetail from "./pages/VehicleDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/vehiculos" element={<DashboardVehicles />} />
            <Route path="/dashboard/vehiculos/nuevo" element={<DashboardNewVehicle />} />
            <Route path="/dashboard/vehiculos/:vehicleId/editar" element={<DashboardEditVehicle />} />
            <Route path="/dashboard/perfil" element={<DashboardProfile />} />
            <Route path="/dashboard/analiticas" element={<DashboardAnalytics />} />
            <Route path="/:username" element={<AgencyCatalog />} />
            <Route path="/:username/:vehicleId" element={<VehicleDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
