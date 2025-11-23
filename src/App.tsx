import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Comments from "./pages/Comments";
import Messages from "./pages/Messages";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import SuperAdmin from "./pages/SuperAdmin";
import Pages from "./pages/Pages";
import PageManagement from "./pages/PageManagement";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Global handler for OAuth errors appearing on any route
const OAuthErrorHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');
    if (error || errorCode || errorDescription) {
      // Redirect users to /auth for a clean retry and URL cleanup
      navigate('/auth', { replace: true });
    }
  }, [location.search, navigate]);
  return null;
};

const App = () => (
  <HelmetProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OAuthErrorHandler />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
              <Route path="/comments" element={<ProtectedRoute><Layout><Comments /></Layout></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
              <Route path="/pages" element={<ProtectedRoute><Layout><Pages /></Layout></ProtectedRoute>} />
              <Route path="/pages/:pageId" element={<ProtectedRoute><Layout><PageManagement /></Layout></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
              <Route path="/superadmin" element={<ProtectedRoute><Layout><SuperAdmin /></Layout></ProtectedRoute>} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </HelmetProvider>
);

export default App;
