
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DilCareLayout } from "./components/layout/DilCareLayout";
import Index from "./pages/Index";
import MedicineReminder from "./pages/MedicineReminder";
import HealthTracker from "./pages/HealthTracker";
import StepTracker from "./pages/StepTracker";
import WaterTracker from "./pages/WaterTracker";
import BMICalculator from "./pages/BMICalculator";
import GyaanCorner from "./pages/GyaanCorner";
import SOSEmergency from "./pages/SOSEmergency";
import AIAssistant from "./pages/AIAssistant";
import DoctorSection from "./pages/DoctorSection";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DilCareLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/medicine" element={<MedicineReminder />} />
            <Route path="/health" element={<HealthTracker />} />
            <Route path="/steps" element={<StepTracker />} />
            <Route path="/water" element={<WaterTracker />} />
            <Route path="/bmi" element={<BMICalculator />} />
            <Route path="/gyaan" element={<GyaanCorner />} />
            <Route path="/sos" element={<SOSEmergency />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/doctor" element={<DoctorSection />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DilCareLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
