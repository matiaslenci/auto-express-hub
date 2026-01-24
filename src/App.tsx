import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileOnboarding from "./pages/ProfileOnboarding";
import Dashboard from "./pages/Dashboard";
import DashboardVehicles from "./pages/DashboardVehicles";
import DashboardNewVehicle from "./pages/DashboardNewVehicle";
import DashboardProfile from "./pages/DashboardProfile";
import AgencyCatalog from "./pages/AgencyCatalog";
import VehicleDetail from "./pages/VehicleDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/onboarding" element={<ProfileOnboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/vehiculos" element={<DashboardVehicles />} />
          <Route path="/dashboard/vehiculos/nuevo" element={<DashboardNewVehicle />} />
          <Route path="/dashboard/perfil" element={<DashboardProfile />} />
          <Route path="/:username" element={<AgencyCatalog />} />
          <Route path="/:username/:vehicleId" element={<VehicleDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
