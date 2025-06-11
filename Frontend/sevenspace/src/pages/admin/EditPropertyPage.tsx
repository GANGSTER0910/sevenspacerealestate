import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Property } from '@/types/property';

const EditPropertyPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/property_service/property/${propertyId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property');
      }

      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Failed to fetch property details",
        variant: "destructive",
      });
      navigate('/admin/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!propertyId) return;
    
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // First upload new images if any
      let imageUrls: string[] = property?.images || [];
      if (selectedFiles.length > 0) {
      const imageFormData = new FormData();
      selectedFiles.forEach(file => {
      imageFormData.append('file', file);
  });

  const uploadResponse = await fetch('http://localhost:8000/image_service/upload?folder=properties', {
    method: 'POST',
    credentials: 'include',
    body: imageFormData
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload images');
  }

  const imageData = await uploadResponse.json();
  imageUrls = imageData.map((img: any) => img.url);
}

      const propertyData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        property_type: formData.get('property_type') as string,
        location: formData.get('location') as string,
        price: parseFloat(formData.get('price') as string),
        area_sqft: formData.get('area_sqft') ? parseFloat(formData.get('area_sqft') as string) : undefined,
        bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : undefined,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : undefined,
        amenities: (formData.get('amenities') as string).split(',').map(a => a.trim()),
        status: formData.get('status') as string || 'available',
        images: imageUrls, // Use the uploaded image URLs
      };

      const response = await fetch(`http://localhost:8000/property_service/property/edit/${propertyId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update property');
      }

      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      
      navigate('/admin/properties');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Property">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p>Loading property details...</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!property) {
    return (
      <AdminLayout title="Edit Property">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p>Property not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Property">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    defaultValue={property.title}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select name="property_type" defaultValue={property.property_type} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Cottage">Cottage</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    defaultValue={property.location}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    defaultValue={property.price}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_sqft">Area (sq ft)</Label>
                  <Input 
                    id="area_sqft" 
                    name="area_sqft" 
                    type="number" 
                    min="0"
                    defaultValue={property.area_sqft} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input 
                    id="bedrooms" 
                    name="bedrooms" 
                    type="number" 
                    min="0"
                    defaultValue={property.bedrooms} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input 
                    id="bathrooms" 
                    name="bathrooms" 
                    type="number" 
                    min="0"
                    defaultValue={property.bathrooms} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={property.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input 
                    id="amenities" 
                    name="amenities" 
                    placeholder="pool, garden, parking"
                    defaultValue={property.amenities?.join(', ')} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={property.description}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Update Images (Optional)</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-500">
                  Leave empty to keep existing images. Select new images to replace all existing ones.
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/properties')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating Property...' : 'Update Property'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditPropertyPage;