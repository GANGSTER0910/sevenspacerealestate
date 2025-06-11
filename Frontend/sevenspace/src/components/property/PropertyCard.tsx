import React from "react";
import { Link } from "react-router-dom";
import { Property } from "@/types/property";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  const statusColor = {
    available: "bg-green-100 text-green-800",
    rented: "bg-blue-100 text-blue-800",
    sold: "bg-purple-100 text-purple-800",
    pending: "bg-yellow-100 text-yellow-800"
  };

  return (
    <Link 
      to={`/property/${property._id}`} 
      className="group block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative">
        <img
          src={property.images[0] || "https://via.placeholder.com/300x200"}
          alt={property.title}
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className={statusColor[property.status]}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-realestate-primary transition-colors duration-300">
          {property.title}
        </h3>
        
        <div className="flex items-center mt-1 text-gray-600">
          <MapPin className="h-4 w-4 text-realestate-primary mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{property.location}</span>
        </div>
        
        <p className="mt-3 text-xl font-bold text-realestate-secondary">
          {formatPrice(property.price)}
          <span className="text-sm font-normal text-gray-500">
            {property.property_type === 'PG' || property.property_type === 'Hostel' ? '/month' : ''}
          </span>
        </p>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area_sqft} sq.ft.</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
