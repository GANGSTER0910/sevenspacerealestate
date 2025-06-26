import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { propertyService } from "@/services/property.service";

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
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const propertyTypes = [
    { type: "Apartment", title: "Apartments", image: "https://res.cloudinary.com/dzhwkg2io/image/upload/v1750851829/properties/monmmkviuxcinyiicide.jpg" },
    { type: "Flat", title: "Flats", image: "https://res.cloudinary.com/dzhwkg2io/image/upload/v1750851796/properties/kf1swhmwwbuadcjqd8b2.jpg" },
    { type: "PG", title: "PGs", image: "https://res.cloudinary.com/dzhwkg2io/image/upload/v1750851769/properties/ygnanfapqsmvbcd0ml8w.jpg" },
    { type: "Hostel", title: "Hostels", image: "https://res.cloudinary.com/dzhwkg2io/image/upload/v1750851736/properties/cq4qc15vtk5yd76ov4gj.jpg" },
  ];

  useEffect(() => {
    const fetchPropertyCounts = async () => {
      try {
        const counts: Record<string, number> = {};
        
        // Fetch counts for each property type
        for (const type of propertyTypes) {
          const response = await propertyService.getAll({ category: type.type });
          counts[type.type] = response.count;
        }
        
        setPropertyCounts(counts);
      } catch (error) {
        console.error('Error fetching property counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyCounts();
  }, []);

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
            <PropertyTypeCard 
              key={type.type} 
              {...type} 
              count={isLoading ? 0 : propertyCounts[type.type] || 0} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyTypeSection;
