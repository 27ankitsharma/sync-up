import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { KnowledgeSelectionProvider } from "@/contexts/KnowledgeSelectionContext";
import { LensProvider } from "@/contexts/LensContext";
import Home from "@/routes/Home";
import Syllabus from "@/routes/Syllabus";
import TopicPage from "@/routes/TopicPage";
import Radar from "@/routes/Radar";
import Login from "@/routes/Login";
import Profile from "@/routes/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KnowledgeSelectionProvider>
          <LensProvider>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/livemap" element={<Layout><Syllabus /></Layout>} />
              <Route path="/syllabus" element={<Navigate to="/livemap" replace />} />
              <Route path="/topic/:slug" element={<TopicPage />} />
              <Route path="/topics/:slug" element={<TopicPage />} />
              <Route path="/radar" element={<Layout><Radar /></Layout>} />
              <Route path="/syllabus-map" element={<Navigate to="/livemap" replace />} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </LensProvider>
        </KnowledgeSelectionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
