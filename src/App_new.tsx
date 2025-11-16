import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DilCareLayout } from "./components/layout/DilCareLayout";
import Index from "./pages/Index";
import MedicineReminder from "./pages/MedicineReminder";
import HealthTracker from "./pages/HealthTracker";
import BMICalculator from "./pages/BMICalculator";
import WaterTracker from "./pages/WaterTracker";
import GyaanCorner from "./pages/GyaanCorner";
import SOSEmergency from "./pages/SOSEmergency";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import DoctorSection from "./pages/DoctorSection";
import StepTracker from "./pages/StepTracker";

const App = () => {
  return (
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/doctor" element={<DoctorSection />} />
          <Route path="*" element={<div className="text-center p-8">Page not found</div>} />
        </Routes>
      </DilCareLayout>
    </BrowserRouter>
  );
};

export default App;
