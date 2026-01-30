import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TestDashboard from "./pages/TestDashboard";
import TestRunner from "./pages/TestRunner";
import TestResults from "./pages/TestResults";
import Leaderboard from "./pages/Leaderboard";
import StudySession from "./pages/StudySession";
import QuickQuiz from "./pages/QuickQuiz";
import EtymologyDashboard from "./pages/EtymologyDashboard";
import EtymologyDetail from "./pages/EtymologyDetail";
import VerbalPractice from "./pages/VerbalPractice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AnimatedBackground />
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <PWAInstallPrompt />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/tests" element={<TestDashboard />} />
            <Route path="/test/:testId" element={<TestRunner />} />
            <Route path="/test/:testId/results" element={<TestResults />} />
            <Route path="/etymology" element={<EtymologyDashboard />} />
            <Route path="/etymology/:rootId" element={<EtymologyDetail />} />
            <Route path="/verbal" element={<VerbalPractice />} />
            <Route path="/study" element={<StudySession />} />
            <Route path="/quick-quiz" element={<QuickQuiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
