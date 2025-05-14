
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PropertyGrid from "@/components/property/PropertyGrid";
import PropertyFilter from "@/components/property/PropertyFilter";
import { getAllProperties, filterProperties } from "@/services/propertyService";
import { PropertyFilterOptions, Property } from "@/types/property";
import { toast } from "sonner";

const PropertyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");
  
  const [allProperties] = useState(getAllProperties());
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(
    typeFromUrl 
      ? allProperties.filter(prop => prop.type === typeFromUrl)
      : allProperties
  );
  
  // Apply the type filter from URL when component mounts or URL changes
  useEffect(() => {
    if (typeFromUrl) {
      const typeFiltered = allProperties.filter(prop => prop.type === typeFromUrl);
      setFilteredProperties(typeFiltered);
      
      if (typeFiltered.length === 0) {
        toast.info(`No ${typeFromUrl} properties found.`);
      } else {
        toast.success(`Found ${typeFiltered.length} ${typeFromUrl} properties.`);
      }
    } else {
      setFilteredProperties(allProperties);
    }
  }, [typeFromUrl, allProperties]);
  
  const handleFilter = (filters: PropertyFilterOptions) => {
    console.log("Filtering with:", filters);
    try {
      // If there's a type in the URL, add it to the filters
      const combinedFilters: PropertyFilterOptions = typeFromUrl && !filters.type
        ? { ...filters, type: typeFromUrl as any }
        : filters;
      
      const filtered = filterProperties(combinedFilters);
      setFilteredProperties(filtered);
      
      if (filtered.length === 0) {
        toast.info("No properties match your filters. Try adjusting your criteria.");
      } else {
        toast.success(`Found ${filtered.length} properties matching your criteria.`);
      }
    } catch (error) {
      console.error("Error filtering properties:", error);
      toast.error("Error applying filters. Please try again.");
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            {typeFromUrl 
              ? `${typeFromUrl.charAt(0).toUpperCase() + typeFromUrl.slice(1)} Properties` 
              : 'Available Properties'}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Browse our selection of properties and find your perfect space
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <PropertyFilter onFilter={handleFilter} initialType={typeFromUrl || undefined} />
          </aside>
          
          <main className="lg:w-3/4">
            {filteredProperties.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search filters or browse all properties.</p>
                <button 
                  onClick={() => setFilteredProperties(allProperties)}
                  className="mt-4 px-4 py-2 bg-realestate-primary text-white rounded-md hover:bg-realestate-secondary"
                >
                  View All Properties
                </button>
              </div>
            ) : (
              <PropertyGrid properties={filteredProperties} />
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyPage;
