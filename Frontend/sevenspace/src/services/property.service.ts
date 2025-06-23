import fetchApi from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Property as PropertyType, PropertyType as PropertyTypeEnum, PropertyStatus } from '@/types/property';

const mapBackendToFrontendProperty = (prop: any): PropertyType => {
  const area = typeof prop.area_sqft === 'number' ? prop.area_sqft : 0;
  return {
    _id: String(prop._id || prop.id),
    title: String(prop.title),
    property_type: prop.property_type as PropertyTypeEnum,
    description: String(prop.description),
    price: Number(prop.price),
    location: String(prop.location),
    area_sqft: parseFloat(prop.area_sqft), 
    bedrooms: Number(prop.bedrooms || 0),
    bathrooms: Number(prop.bathrooms || 0),
    amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
    images: Array.isArray(prop.images) ? prop.images : [],
    status: (prop.status || 'available') as PropertyStatus,
    listed_date: String(prop.listed_date || new Date().toISOString().split('T')[0]),
    features: Array.isArray(prop.features) ? prop.features : [],
  };
};
const url = import.meta.env.VITE_PROPERTY_URL || 'http://localhost:8000';

const mapFrontendToBackendProperty = (prop: Omit<PropertyType, '_id'>) => {
  const area_sqft = typeof prop.area_sqft === 'number' ? prop.area_sqft : 0;
  return {
    ...prop,
    property_type: prop.property_type,
    area_sqft,
    listed_date: prop.listed_date
  };
};

export interface PropertyResponse {
  count: number;
  properties: PropertyType[];
}

export interface PropertyFilters {
  category?: string;
  status?: string;
  limit?: number;
  sortBy?: string;
}

export const propertyService = {
  async getAll(filters?: PropertyFilters): Promise<PropertyResponse> {
    try {
      if (filters?.limit === 8 && filters?.sortBy === 'listed_date') {
        const response = await fetchApi('/property/home', {
          method: 'GET',
        });
        console.log("Response from /home:", response); // Debug log
        if (!response || !Array.isArray(response.properties)) {
            console.error("Invalid response format for home properties:", response);
            return { count: 0, properties: [] };
        }
        const properties = response.properties.map(mapBackendToFrontendProperty);
        return { count: response.count || 0, properties };
      }

      if (filters?.category && filters.category !== 'all') {
        const response = await fetchApi('/property/category', {
          method: 'GET',
          params: {
            category: filters.category,
            status: filters.status || 'available',
          }
        });
        console.log("Response from /category:", response); // Debug log
        if (!response || !Array.isArray(response.properties)) {
            console.error("Invalid response format for category filter:", response);
            return { count: 0, properties: [] };
        }
        const properties = response.properties.map(mapBackendToFrontendProperty);
        return { count: response.count || 0, properties };
      }
      
      const response = await fetchApi('/property/all', {
        method: 'GET',
        params: {
          status: filters?.status || 'available',
        }
      });
      
      console.log("Response from /all:", response); // Debug log
      // Ensure response is valid and has properties array before mapping
      if (!response || !Array.isArray(response.properties)) {
          console.error("Invalid response format for all properties:", response);
          return { count: 0, properties: [] };
      }
      
      const properties = response.properties.map(mapBackendToFrontendProperty);
      return { count: response.count || 0, properties };
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Re-throw the error so react-query can handle it and set the error state
      throw error;
    }
  },

  async create(property: Omit<PropertyType, '_id'>, files: File[]): Promise<{ message: string; property: PropertyType }> {
    const formData = new FormData();
    
    // Add property data as a JSON string
    const propertyData = {
      ...mapFrontendToBackendProperty(property),
      title: property.title.trim().toLowerCase(),
      location: property.location.trim(),
    };
    formData.append('property', JSON.stringify(propertyData));
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetchApi('/property', {
      method: 'POST',
      headers: {
        'Content-Type': undefined
      },
      body: formData
    });

    return {
      message: response.message,
      property: mapBackendToFrontendProperty(response.property)
    };
  },

  async getById(id: string): Promise<PropertyType> {
    const response = await fetchApi(`/property/${id}`, {
      method: 'GET'
    });
    return mapBackendToFrontendProperty(response);
  },

  async update(id: string, property: Partial<PropertyType>): Promise<PropertyType> {
    const response = await fetchApi(`/property/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: property.title,
        description: property.description,
        property_type: property.property_type,
        location: property.location,
        price: property.price,
        area_sqft: property.area_sqft,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        amenities: property.amenities,
        images: property.images,
        status: property.status,
        listed_date: property.listed_date,
        featured: property.features
      })
    });
    return mapBackendToFrontendProperty(response);
  },

  async delete(id: string): Promise<void> {
    return fetchApi(`/property/${id}`, {
      method: 'DELETE'
    });
  },

  async addToFavorites(propertyId: string): Promise<{ message: string }> {
    return fetchApi(`/property/${propertyId}/favorite`, {
      method: 'POST'
    });
  },

  async removeFromFavorites(propertyId: string): Promise<{ message: string }> {
    return fetchApi(`/property/${propertyId}/favorite`, {
      method: 'DELETE'
    });
  },

  async getFavorites(): Promise<PropertyType[]> {
    const response = await fetchApi('/property/favorites', {
      method: 'GET'
    });
    return response.favorites.map(mapBackendToFrontendProperty);
  },
  async search(query: string): Promise<PropertyResponse> {
    const trimmed = query.trim();
    if (!trimmed) return { count: 0, properties: [] };
    
    try {
      const firstTry = await fetchApi('/property/search', {
        method: 'GET',
        params: { q: trimmed }
      });

      if (firstTry && Array.isArray(firstTry.properties) && firstTry.properties.length > 0) {
        return {
          count: firstTry.count,
          properties: firstTry.properties.map(mapBackendToFrontendProperty)
        };
      }

      // If no results and query has multiple words, try searching last word
      const tokens = trimmed.split(/\s+/).filter(Boolean);
      if (tokens.length > 1) {
        const lastWord = tokens[tokens.length - 1];
        const secondTry = await fetchApi('/property/search', {
          method: 'GET',
          params: { q: lastWord }
        });

        if (secondTry && Array.isArray(secondTry.properties) && secondTry.properties.length > 0) {
          return {
            count: secondTry.count,
            properties: secondTry.properties.map(mapBackendToFrontendProperty)
          };
        }
      }

      // Final fallback: get all and client-side filter
      const all = await propertyService.getAll();
      const lower = trimmed.toLowerCase();
      const filtered = all.properties.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.location.toLowerCase().includes(lower) ||
        p.property_type.toLowerCase().includes(lower)
      );
      
      return { count: filtered.length, properties: filtered };
    } catch (error) {
      console.error('Search error:', error);
      return { count: 0, properties: [] };
    }
  }
};

// React Query hooks
export const useProperties = (filters?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getAll(filters),
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ property, files }: { property: Omit<PropertyType, '_id'>; files: File[] }) =>
      propertyService.create(property, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, property }: { id: string; property: Partial<PropertyType> }) =>
      propertyService.update(id, property),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => propertyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}; 