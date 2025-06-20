import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
const url = process.env.url || 'http://localhost:8000';
const image_url = process.env.image_url || 'http://localhost:8003/';
const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // ... inside handleSubmit
let imageUrls: string[] = [];
if (selectedFiles.length > 0) {
  for (const file of selectedFiles) {
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    const uploadResponse = await fetch(`${image_url}/upload?folder=properties`, {
      method: 'POST',
      credentials: 'include',
      body: imageFormData
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload images');
    }

    // const imageData = await uploadResponse.json();
    // console.log('Image uploaded:', imageData.url);
    // imageUrls.push(imageData.url);
  const imageData = await uploadResponse.json();
const urls = imageData
  .flat() // flatten one level
  .map((item: any) => item.url)
  .filter(Boolean);

imageUrls.push(...urls);

  }
}
      // Create the property data object with image URLs
      const propertyData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        property_type: formData.get('property_type') as string,
        location: formData.get('location') as string,
        price: parseFloat(formData.get('price') as string),
        area_sqft: formData.get('area_sqft') ? parseFloat(formData.get('area_sqft') as string) : undefined,
        bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : undefined,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : undefined,
        amenities: typeof formData.get('amenities') === 'string'
  ? (formData.get('amenities') as string).split(',').map(a => a.trim())
  : [],
        status: formData.get('status') as string || 'available',
        images: imageUrls, // Use all image URLs
      };

      // Create property with the image URLs
      const response = await fetch(`${url}/property_service/property`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add property');
      }

      toast({
        title: "Success",
        description: "Property added successfully",
      });
      
      navigate('/admin/properties');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add property",
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

  return (
    <AdminLayout title="Add Property">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select name="property_type" required>
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
                  <Input id="location" name="location" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_sqft">Area (sq ft)</Label>
                  <Input id="area_sqft" name="area_sqft" type="number" min="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" name="bedrooms" type="number" min="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" name="bathrooms" type="number" min="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="available">
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
                  <Input id="amenities" name="amenities" placeholder="pool, garden, parking" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
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
                  {isSubmitting ? 'Adding Property...' : 'Add Property'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddPropertyPage;
