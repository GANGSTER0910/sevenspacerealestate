import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail } from "lucide-react";
import OTPVerification from "@/components/auth/OTPVerification";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import PasswordResetSuccess from "@/components/auth/PasswordResetSuccess";
import { authService } from "@/services/auth.service";

type Step = "email" | "otp" | "reset" | "success";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [generatedOTP, setGeneratedOTP] = useState<number | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await authService.requestPasswordReset(email);
      setGeneratedOTP(response.otp); // Store the OTP from response
      setCurrentStep("otp");
      toast({
        title: "OTP Sent",
        description: "We've sent a 6-digit verification code to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerified = () => {
    setCurrentStep("reset");
  };

  const handlePasswordReset = () => {
    setCurrentStep("success");
  };

  const handleBackToEmail = () => {
    setCurrentStep("email");
    setGeneratedOTP(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "email":
        return (
          <Card className="w-full">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a verification code
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSendOTP}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-realestate-primary hover:bg-realestate-secondary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Verification Code"}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <div className="text-sm text-gray-500">
                <Link to="/login" className="underline hover:text-gray-700">
                  Return to login
                </Link>
              </div>
            </CardFooter>
          </Card>
        );

      case "otp":
        return (
          <OTPVerification
            email={email}
            onVerifySuccess={handleOTPVerified}
            onBack={handleBackToEmail}
          />
        );

      case "reset":
        return (
          <PasswordResetForm
            email={email}
            onResetSuccess={handlePasswordReset}
          />
        );

      case "success":
        return <PasswordResetSuccess />;

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12 px-4">
        {renderCurrentStep()}
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;