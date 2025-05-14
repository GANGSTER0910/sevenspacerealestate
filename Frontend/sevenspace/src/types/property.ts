
export type PropertyType = 'apartment' | 'flat' | 'pg' | 'hostel' | 'cottage' | 'house' | 'villa';

export type PropertyStatus = 'available' | 'rented' | 'sold' | 'pending';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  description: string;
  price: number;
  location: string;
  area: number; // in sq.ft.
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  status: PropertyStatus;
  listedDate: string;
  featured?: boolean;
}

export interface PropertyFilterOptions {
  type?: PropertyType;
  priceRange?: { min?: number; max?: number };
  bedrooms?: number;
  bathrooms?: number;
}
