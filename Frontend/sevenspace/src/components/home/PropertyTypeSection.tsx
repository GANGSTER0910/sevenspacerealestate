
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PropertyTypeCardProps {
  type: string;
  title: string;
  image: string;
  count: number;
}

const PropertyTypeCard: React.FC<PropertyTypeCardProps> = ({ type, title, image, count }) => {
  return (
    <Link 
      to={`/property?type=${type}`} 
      className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm">{count} Properties</span>
            <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const PropertyTypeSection: React.FC = () => {
  const propertyTypes = [
    { type: "apartment", title: "Apartments", image: "/lovable-uploads/5f8c14d4-6d14-4ff2-8844-b9bfecf97271.png", count: 24 },
    { type: "flat", title: "Flats", image: "/lovable-uploads/5db3b84e-3519-4a36-98c1-b19371c9b938.png", count: 15 },
    { type: "pg", title: "PGs", image: "/lovable-uploads/54bf8a19-b756-4f09-b13e-93f23aae4b85.png", count: 18 },
    { type: "hostel", title: "Hostels", image: "/lovable-uploads/8e25e883-2f3e-4416-8192-5ea5cea42c52.png", count: 9 },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Browse By Property Type</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Find the perfect property that suits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((type) => (
            <PropertyTypeCard key={type.type} {...type} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyTypeSection;
