export type PropertyType = 'Apartment' | 'House' | 'Flat' | 'Cottage' | 'PG' | 'Hostel';

export type PropertyStatus = 'available' | 'sold' | 'pending' | 'rented';

export interface Property {
  _id: string;
  title: string;
  property_type: PropertyType;
  description: string;
  price: number;
  location: string;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  images?: string[];
  status: PropertyStatus;
  listed_date?: string;
  features?: string[];
}

export interface PropertyFilterOptions {
  type?: PropertyType;
  priceRange?: { min?: number; max?: number };
  bedrooms?: number;
  bathrooms?: number;
}
