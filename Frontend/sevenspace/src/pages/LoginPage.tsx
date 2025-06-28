import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Note: Navigation is now handled in the AuthContext
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-start">
          <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Sign in to access your account and manage your properties, favorites, and inquiries.
            </p>
            <div className="hidden lg:block">
              <img
                src="https://res.cloudinary.com/dzhwkg2io/image/upload/v1751111317/properties/zrgxmupa3c0a6v1uwe2s.png"
                alt="Login"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
          <div className="lg:w-1/2">
            <LoginForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
