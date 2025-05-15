
import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center">
              <img
                className="h-14 w-auto"
                src="/lovable-uploads/image.png"
                alt="SevenSpace"
              />
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-800">SevenSpace</h2>
                <p className="text-sm text-gray-500">Real Estate</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 text-sm text-center md:text-left">
              Finding your perfect space is our mission. We connect people with their 
              dream properties and help them make informed real estate decisions.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-medium text-gray-900">Helpful Links</h3>
            <div className="mt-4 space-y-2">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-realestate-primary block"
              >
                Home
              </Link>
              <Link 
                to="/property" 
                className="text-gray-600 hover:text-realestate-primary block"
              >
                Property
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-realestate-primary block"
              >
                About
              </Link>
              <Link 
                to="/services" 
                className="text-gray-600 hover:text-realestate-primary block"
              >
                Services
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-medium text-gray-900">Corporate Head Office</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-realestate-primary mr-2" />
                <span className="text-gray-600">+91 99251 11624</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-realestate-primary mr-2" />
                <span className="text-gray-600"> pravin.sachaniya@gmail.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-realestate-primary mr-2 flex-shrink-0" />
                <span className="text-gray-600"> B – 435, SOBO Center, South Bopal, Ahmedabad – 380058</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} SevenSpace Real Estate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
