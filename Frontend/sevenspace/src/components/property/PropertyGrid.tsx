
import React from "react";
import PropertyCard from "./PropertyCard";
import { Property } from "@/types/property";

interface PropertyGridProps {
  properties: Property[];
  title?: string;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, title }) => {
  return (
    <div className="my-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      
      {properties.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;
