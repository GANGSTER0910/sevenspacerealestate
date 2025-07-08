import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth(); // Or whatever method you use to store JWT

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setToken(token); // Save token (localStorage, context, etc.)
      navigate("/user/dashboard"); // or "/admin/dashboard" if you decode the token and check role
    } else {
      navigate("/login");
    }
  }, [navigate, setToken]);

  return <div>Signing you in with Google...</div>;
};

export default GoogleCallbackPage;
