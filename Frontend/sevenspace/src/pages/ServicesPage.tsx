
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Home, Search, DollarSign, Users, Clock, Clipboard, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: Home,
      title: "Property Listing",
      description: "List your property with us for maximum exposure to potential buyers or renters."
    },
    {
      icon: Search,
      title: "Property Finding",
      description: "Let us help you find the perfect property that meets all your requirements."
    },
    {
      icon: DollarSign,
      title: "Property Valuation",
      description: "Get an accurate valuation of your property based on market trends and location."
    },
    {
      icon: Users,
      title: "Tenant Screening",
      description: "We thoroughly screen all potential tenants to ensure reliability and timely payments."
    },
    {
      icon: Building,
      title: "Property Management",
      description: "Full-service property management for landlords who want a hassle-free experience."
    },
    {
      icon: Clock,
      title: "Short-term Rentals",
      description: "Maximize your property's income with our short-term rental management services."
    },
    {
      icon: Clipboard,
      title: "Legal Assistance",
      description: "Our experts help with all legal aspects of property buying, selling, and renting."
    },
    {
      icon: HeartHandshake,
      title: "Investment Consulting",
      description: "Get expert advice on real estate investments to maximize your returns."
    }
  ];

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              We offer a wide range of real estate services to meet all your property needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="bg-realestate-light p-3 rounded-full w-fit">
                  <service.icon className="h-6 w-6 text-realestate-primary" />
                </div>
                <CardTitle className="mt-4">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Learn more about our {service.title.toLowerCase()} service and how we can help you.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-realestate-light rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Need Custom Services?</h2>
            <p className="mt-4 text-lg text-gray-600">
              We understand that every client has unique needs. Contact us to discuss how we can tailor our services for you.
            </p>
            <div className="mt-6">
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-realestate-primary hover:bg-realestate-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-realestate-primary"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServicesPage;
