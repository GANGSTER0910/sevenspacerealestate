import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React from 'react';

// Main pages
import HomePage from "./pages/HomePage";
import PropertyPage from "./pages/PropertyPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboardPage from "./pages/UserDashboardPage";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPropertiesPage from "./pages/admin/AdminPropertiesPage";
import AddPropertyPage from "./pages/admin/AddPropertyPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminHelpPage from "./pages/admin/AdminHelpPage";

// Other
import NotFound from "./pages/NotFound";

// Create the query client outside of the component
const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/property" element={<PropertyPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />

              {/* Protected User Routes */}
              <Route 
                path="/user/dashboard" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
