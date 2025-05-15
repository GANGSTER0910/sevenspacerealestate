import fetchApi from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  location: string;
  price: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  images?: string[];
  listed_date?: string;
  status?: string;
}

export interface PropertyResponse {
  count: number;
  properties: Property[];
}

export interface PropertyFilters {
  category?: string;
  status?: string;
}

export const propertyService = {
  async getAll(filters?: PropertyFilters): Promise<PropertyResponse> {
    if (filters?.category && filters.category !== 'all') {
      return fetchApi('/property/category', {
        method: 'GET',
        params: {
          category: filters.category,
          status: filters.status || 'available'
        }
      });
    }
    return fetchApi('/property/all', {
      method: 'GET',
      params: {
        status: filters?.status || 'available'
      }
    });
  },

  async create(property: Omit<Property, 'id'>, files: File[]): Promise<{ message: string; property: Property }> {
    const formData = new FormData();
    
    // Add property data as a JSON string
    const propertyData = {
      ...property,
      title: property.title.trim().toLowerCase(),
      location: property.location.trim()
    };
    formData.append('property', JSON.stringify(propertyData));
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return fetchApi('/property', {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let the browser set it with the boundary
        'Content-Type': undefined
      },
      body: formData
    });
  },

  // Note: These endpoints are commented out in your backend
  // Uncomment them in the backend if you need these features
  async getById(id: string): Promise<Property> {
    return fetchApi(`/property/${id}`, {
      method: 'GET'
    });
  },

  async update(id: string, property: Partial<Property>): Promise<Property> {
    return fetchApi(`/property/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property)
    });
  },

  async delete(id: string): Promise<void> {
    return fetchApi(`/property/${id}`, {
      method: 'DELETE'
    });
  },
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
    mutationFn: ({ property, files }: { property: Omit<Property, 'id'>; files: File[] }) =>
      propertyService.create(property, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, property }: { id: string; property: Partial<Property> }) =>
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