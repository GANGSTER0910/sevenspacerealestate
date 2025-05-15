import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyService, Property, PropertyFilters } from '@/services/property.service';

export const useProperties = (filters?: PropertyFilters) => {
  const queryClient = useQueryClient();

  const properties = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getAll(filters),
  });

  const createProperty = useMutation({
    mutationFn: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) =>
      propertyService.create(property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const updateProperty = useMutation({
    mutationFn: ({ id, property }: { id: string; property: Partial<Property> }) =>
      propertyService.update(id, property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: (id: string) => propertyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  return {
    properties: properties.data || [],
    isLoading: properties.isLoading,
    error: properties.error,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}; 