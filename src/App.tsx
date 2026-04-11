
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
import Notifications from "./pages/Notifications";
import ChildDashboard from "./pages/ChildDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { UserModeProvider } from "@/hooks/useUserMode";
import FamilyLocation from "./pages/FamilyLocation";
import CommunityLeaderboardPage from "./pages/community/CommunityLeaderboardPage";
import CommunityGroupsPage from "./pages/community/CommunityGroupsPage";
import CommunityMyGroupPage from "./pages/community/CommunityMyGroupPage";
import CommunityChallengesPage from "./pages/community/CommunityChallengesPage";
import CommunityFeedPage from "./pages/community/CommunityFeedPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DilCareLayout>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/index" element={<Index />} />
              <Route path="/child-dashboard/location" element={<FamilyLocation />} />
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
              <Route path="/community/leaderboard" element={<CommunityLeaderboardPage />} />
              <Route path="/community/groups" element={<CommunityGroupsPage />} />
              <Route path="/community/my-group" element={<CommunityMyGroupPage />} />
              <Route path="/community/my-group/:groupId" element={<CommunityMyGroupPage />} />
              <Route path="/community/challenges" element={<CommunityChallengesPage />} />
              <Route path="/community/feed" element={<CommunityFeedPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/child-dashboard" element={<ChildDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DilCareLayout>
        </BrowserRouter>
      </TooltipProvider>
    </UserModeProvider>
  </QueryClientProvider>
);

export default App;
