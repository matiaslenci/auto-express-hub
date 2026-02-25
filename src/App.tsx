import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
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
import DashboardAdmin from "./pages/DashboardAdmin";
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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/vehiculos" element={<ProtectedRoute><DashboardVehicles /></ProtectedRoute>} />
            <Route path="/dashboard/vehiculos/nuevo" element={<ProtectedRoute><DashboardNewVehicle /></ProtectedRoute>} />
            <Route path="/dashboard/vehiculos/:vehicleId/editar" element={<ProtectedRoute><DashboardEditVehicle /></ProtectedRoute>} />
            <Route path="/dashboard/perfil" element={<ProtectedRoute><DashboardProfile /></ProtectedRoute>} />
            <Route path="/dashboard/analiticas" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute adminOnly><DashboardAdmin /></ProtectedRoute>} />
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

