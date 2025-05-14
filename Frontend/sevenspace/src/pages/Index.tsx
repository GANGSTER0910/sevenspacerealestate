
import React from "react";
import { Navigate } from "react-router-dom";

// Update index page to redirect to our main homepage
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
