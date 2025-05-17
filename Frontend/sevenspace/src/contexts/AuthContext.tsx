import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { authService } from '@/services/auth.service';

type User = {
  email: string;
  role: 'admin' | 'user';
  phone?: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, phone?: number) => Promise<boolean>;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.checkAuth();
      if (response.message === "Authenticated") {
        setUser({ 
          email: response.email || '', 
          role: response.role === 'admin' ? 'admin' : 'user' 
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.message === "Thank You! Succesfully Completed") {
        await checkAuth();
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, phone?: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.register({ email, password, phone });
      if (response.message === "Thank You! Succesfully Completed") {
        await checkAuth();
        toast({
          title: "Registration successful",
          description: "Welcome to Seven Space Real Estate!",
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again with different credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // The backend handles session expiration through cookies
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      register,
      isAdmin,
    }}>
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
