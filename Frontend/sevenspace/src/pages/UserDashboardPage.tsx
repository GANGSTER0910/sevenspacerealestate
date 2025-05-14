
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import UserDashboard from "@/components/user/UserDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <UserDashboard />
    </Layout>
  );
};

export default UserDashboardPage;
