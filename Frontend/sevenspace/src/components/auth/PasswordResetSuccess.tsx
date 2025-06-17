import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const PasswordResetSuccess: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Password Reset Complete</CardTitle>
        <CardDescription>
          Your password has been successfully updated
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          You can now sign in with your new password.
        </p>
        
        <Button asChild className="w-full bg-realestate-primary hover:bg-realestate-secondary">
          <Link to="/login">
            Continue to Login
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordResetSuccess;