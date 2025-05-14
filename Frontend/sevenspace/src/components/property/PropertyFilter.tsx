
import React, { useState, useEffect } from "react";
import { PropertyFilterOptions } from "@/types/property";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface PropertyFilterProps {
  onFilter: (filters: PropertyFilterOptions) => void;
  initialType?: string;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({ onFilter, initialType }) => {
  const [filters, setFilters] = useState<PropertyFilterOptions>({
    ...(initialType ? { type: initialType as any } : {})
  });
  const [priceRange, setPriceRange] = useState<[number]>([5000]);

  // Apply initial type filter when component mounts
  useEffect(() => {
    if (initialType) {
      setFilters(prev => ({
        ...prev,
        type: initialType as any
      }));
    }
  }, [initialType]);

  const handleTypeChange = (value: string) => {
    setFilters({ 
      ...filters, 
      type: value === "all" ? undefined : value as any 
    });
  };

  const handleBedroomsChange = (value: string) => {
    setFilters({ 
      ...filters, 
      bedrooms: value === "all" ? undefined : Number(value) 
    });
  };

  const handleBathroomsChange = (value: string) => {
    setFilters({ 
      ...filters, 
      bathrooms: value === "all" ? undefined : Number(value) 
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0]]);
    setFilters({
      ...filters,
      priceRange: { max: values[0] }
    });
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", filters);
    onFilter(filters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPriceRange([5000]);
    onFilter({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <Select 
            onValueChange={handleTypeChange} 
            value={filters.type || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="pg">PG</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
              <SelectItem value="cottage">Cottage</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price: ${priceRange[0]}
          </label>
          <Slider
            defaultValue={[5000]}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={handlePriceChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms
          </label>
          <Select 
            onValueChange={handleBedroomsChange} 
            value={filters.bedrooms?.toString() || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bedrooms</SelectItem>
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedrooms</SelectItem>
              <SelectItem value="3">3 Bedrooms</SelectItem>
              <SelectItem value="4">4+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bathrooms
          </label>
          <Select 
            onValueChange={handleBathroomsChange} 
            value={filters.bathrooms?.toString() || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Bathrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bathrooms</SelectItem>
              <SelectItem value="1">1 Bathroom</SelectItem>
              <SelectItem value="2">2 Bathrooms</SelectItem>
              <SelectItem value="3">3+ Bathrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={handleApplyFilters} className="w-full bg-realestate-primary hover:bg-realestate-secondary">
            Apply Filters
          </Button>
          <Button 
            onClick={handleResetFilters} 
            variant="outline" 
            className="w-full border-realestate-primary text-realestate-primary hover:bg-realestate-light"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilter;
