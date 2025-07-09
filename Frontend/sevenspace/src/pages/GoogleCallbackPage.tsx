import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { googleCheckAuth } = useAuth(); // Or whatever method you use to store JWT

  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        await googleCheckAuth();
        navigate("/user/dashboard");
      } catch {
        navigate("/login");
      }
    };
    checkGoogleAuth();
  }, [navigate]);

  return <div>Signing you in with Google...</div>;
};

export default GoogleCallbackPage;
