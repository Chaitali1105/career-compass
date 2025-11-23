import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import ProfileCompletion from "./pages/ProfileCompletion";
import AssessmentStart from "./pages/assessment/Start";
import AssessmentQuestions from "./pages/assessment/Questions";
import Analysis from "./pages/Analysis";
import Roadmap from "./pages/Roadmap";
import Colleges from "./pages/Colleges";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileCompletion />} />
          <Route path="/assessment/start" element={<AssessmentStart />} />
          <Route path="/assessment/questions" element={<AssessmentQuestions />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
