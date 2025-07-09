import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { authService, LoginResponse } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  role: string;
  name?: string;
  picture?: string;
  id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;      // Original JWT login
  googleLogin: (credential: string) => Promise<void>;            // New Google OAuth
  logout: () => void;
  checkAuth: () => Promise<void>;
  setToken: (token: string) => void;
  isAdmin: () => boolean;
  googleCheckAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const setToken = (token: string) => {
    localStorage.setItem('token', token);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.checkAuth();
      
      if (response.message === "Authenticated") {
        setIsAuthenticated(true);
        const decodedToken = await authService.decodeToken();
        setUserRole(decodedToken.role);
        setUser({ 
          email: decodedToken.email, 
          role: decodedToken.role,
          name: decodedToken.name,
          picture: decodedToken.picture
        });
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Original JWT login - PRESERVED
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      setIsAuthenticated(true);
      setUserRole(response.role);
      setUser({ 
        email, 
        role: response.role,
        ...response.user
      });

      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error('Login error in context:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login - NEW ADDITION
  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleTokenLogin(credential);
      
      setIsAuthenticated(true);
      setUserRole(response.role);
      setUser(response.user || {
        email: response.user?.email || '',
        role: response.role,
        name: response.user?.name,
        picture: response.user?.picture,
        id: response.user?.id
      });

      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

      toast({
        title: "Google login successful",
        description: `Welcome ${response.user?.name || 'back'}!`,
      });
    } catch (error) {
      console.error('Google login error in context:', error);
      toast({
        title: "Google login failed",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // All other existing methods - PRESERVED
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    navigate('/login');
  };

  const isAdmin = () => userRole === 'admin';

  const googleCheckAuth = async () => {
    try {
      const response = await authService.googleCheckAuth();
      if (response.message === "Authenticated") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        user,
        login,          // Original JWT login
        googleLogin,    // New Google OAuth login
        logout,
        checkAuth,
        setToken,
        isAdmin,
        googleCheckAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
