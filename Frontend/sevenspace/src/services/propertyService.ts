
import { Property, PropertyFilterOptions } from "@/types/property";

// Mock property data
const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Cozy apartment with city view",
    type: "apartment",
    description: "A well-furnished apartment with a great city view.",
    price: 1800,
    location: "Los Angeles, CA",
    area: 900,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["Balcony", "24/7 Security", "Lift"],
    images: ["/lovable-uploads/5f8c14d4-6d14-4ff2-8844-b9bfecf97271.png"],
    status: "available",
    listedDate: "2025-03-12",
    featured: true
  },
  {
    id: "2",
    title: "High-rise apartment with rooftop access",
    type: "apartment",
    description: "Modern high-rise apartment with access to a beautiful rooftop garden.",
    price: 2500,
    location: "New York, NY",
    area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["Rooftop Garden", "Gym", "Parking", "Doorman"],
    images: ["/lovable-uploads/5db3b84e-3519-4a36-98c1-b19371c9b938.png"],
    status: "available",
    listedDate: "2025-03-15"
  },
  {
    id: "3",
    title: "Elegant apartment with smart features",
    type: "apartment",
    description: "Luxury apartment with the latest smart home technology.",
    price: 3000,
    location: "San Francisco, CA",
    area: 1500,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["Smart Home System", "In-unit Laundry", "Balcony", "Storage Unit"],
    images: ["/lovable-uploads/54bf8a19-b756-4f09-b13e-93f23aae4b85.png"],
    status: "available",
    listedDate: "2025-03-10"
  },
  {
    id: "4",
    title: "Luxury flat in downtown",
    type: "flat",
    description: "Premium flat located in the heart of downtown.",
    price: 4500,
    location: "Chicago, IL",
    area: 1800,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["Concierge", "Pool", "Gym", "Pet Friendly"],
    images: ["/lovable-uploads/8e25e883-2f3e-4416-8192-5ea5cea42c52.png"],
    status: "available",
    listedDate: "2025-03-20",
    featured: true
  },
  {
    id: "5",
    title: "Affordable PG near university",
    type: "pg",
    description: "Budget-friendly PG accommodation close to major universities.",
    price: 500,
    location: "Boston, MA",
    area: 200,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Furnished", "Wifi", "Meals Included", "Laundry Service"],
    images: ["/lovable-uploads/48b73192-a9c0-4838-8965-59683c2cbcff.png"],
    status: "available",
    listedDate: "2025-03-18",
    featured: true
  },
  {
    id: "6",
    title: "Budget-friendly PG for students",
    type: "pg",
    description: "Economical PG accommodation specially designed for students.",
    price: 450,
    location: "Austin, TX",
    area: 180,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Study Area", "Wifi", "Meals", "Weekly Cleaning"],
    images: ["/lovable-uploads/0fea0c77-435c-4cd3-a530-028906c7b80c.png"],
    status: "available",
    listedDate: "2025-03-22"
  },
  {
    id: "7",
    title: "Modern PG with all facilities",
    type: "pg",
    description: "Fully equipped PG with all modern amenities for a comfortable stay.",
    price: 650,
    location: "Seattle, WA",
    area: 250,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["AC", "Gym Access", "TV Lounge", "High-Speed Internet"],
    images: ["/lovable-uploads/7fedded5-483a-40cf-9754-217d91d099b3.png"],
    status: "available",
    listedDate: "2025-03-25"
  },
  {
    id: "8",
    title: "Beautiful cottage in countryside",
    type: "cottage",
    description: "Charming cottage surrounded by nature and tranquility.",
    price: 2000,
    location: "Vermont",
    area: 1100,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["Fireplace", "Garden", "Parking", "Fully Furnished"],
    images: ["/lovable-uploads/5f8c14d4-6d14-4ff2-8844-b9bfecf97271.png"],
    status: "available",
    listedDate: "2025-03-28",
    featured: true
  },
  {
    id: "9",
    title: "Hostel for students and working professionals",
    type: "hostel",
    description: "Clean and well-maintained hostel suitable for students and young professionals.",
    price: 350,
    location: "San Diego, CA",
    area: 150,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Shared Kitchen", "Wifi", "Common Area", "Security"],
    images: ["/lovable-uploads/5db3b84e-3519-4a36-98c1-b19371c9b938.png"],
    status: "available",
    listedDate: "2025-03-30",
    featured: true
  }
];

export const getAllProperties = (): Property[] => {
  return MOCK_PROPERTIES;
};

export const getPropertyById = (id: string): Property | undefined => {
  return MOCK_PROPERTIES.find(property => property.id === id);
};

export const getFeaturedProperties = (): Property[] => {
  return MOCK_PROPERTIES.filter(property => property.featured);
};

export const getPropertiesByType = (type: string): Property[] => {
  return MOCK_PROPERTIES.filter(property => property.type === type);
};

export const filterProperties = (filters: PropertyFilterOptions): Property[] => {
  return MOCK_PROPERTIES.filter(property => {
    // Filter by type
    if (filters.type && property.type !== filters.type) {
      return false;
    }
    
    // Filter by price range
    if (filters.priceRange) {
      if (filters.priceRange.min && property.price < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max && property.price > filters.priceRange.max) {
        return false;
      }
    }
    
    // Filter by bedrooms
    if (filters.bedrooms && property.bedrooms !== filters.bedrooms) {
      return false;
    }
    
    // Filter by bathrooms
    if (filters.bathrooms && property.bathrooms !== filters.bathrooms) {
      return false;
    }
    
    return true;
  });
};

// For admin functionality
export const addProperty = (property: Omit<Property, 'id'>): Property => {
  const newProperty = {
    ...property,
    id: Math.random().toString(36).substr(2, 9),
  } as Property;
  
  // In a real app, we would send this to an API
  // For demo purposes, we'd just add it to our mock data
  MOCK_PROPERTIES.push(newProperty);
  
  return newProperty;
};

export const updateProperty = (id: string, updatedProperty: Partial<Property>): Property | undefined => {
  const index = MOCK_PROPERTIES.findIndex(property => property.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  // Update the property
  MOCK_PROPERTIES[index] = {
    ...MOCK_PROPERTIES[index],
    ...updatedProperty
  };
  
  return MOCK_PROPERTIES[index];
};

export const deleteProperty = (id: string): boolean => {
  const index = MOCK_PROPERTIES.findIndex(property => property.id === id);
  
  if (index === -1) {
    return false;
  }
  
  // Remove the property
  MOCK_PROPERTIES.splice(index, 1);
  
  return true;
};
