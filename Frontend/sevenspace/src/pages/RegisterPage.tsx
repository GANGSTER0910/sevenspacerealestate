
import React from "react";
import Layout from "@/components/layout/Layout";
import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-start">
          <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your Account</h1>
            <p className="text-lg text-gray-600 mb-8">
              Join SevenSpace to save your favorite properties, receive personalized recommendations, and streamline your property search.
            </p>
            <div className="hidden lg:block">
              <img
                src="/lovable-uploads/5db3b84e-3519-4a36-98c1-b19371c9b938.png"
                alt="Register"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
          <div className="lg:w-1/2">
            <RegisterForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
