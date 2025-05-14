
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Property, PropertyType, PropertyStatus } from "@/types/property";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: Omit<Property, "id">) => void;
  isLoading: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<PropertyType>(initialData?.type || "apartment");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price.toString() || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [area, setArea] = useState(initialData?.area.toString() || "");
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms.toString() || "");
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms.toString() || "");
  const [status, setStatus] = useState<PropertyStatus>(initialData?.status || "available");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  
  // For amenities with checkbox selection
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [newAmenity, setNewAmenity] = useState("");
  
  // For image URLs
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newImage, setNewImage] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !location || !area || !bedrooms || !bathrooms) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const propertyData: Omit<Property, "id"> = {
      title,
      type,
      description,
      price: parseFloat(price),
      location,
      area: parseFloat(area),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      amenities,
      images,
      status,
      listedDate: initialData?.listedDate || new Date().toISOString().split('T')[0],
      featured,
    };
    
    onSubmit(propertyData);
  };
  
  const addAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity]);
      setNewAmenity("");
    }
  };
  
  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };
  
  const addImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages([...images, newImage]);
      setNewImage("");
    }
  };
  
  const removeImage = (image: string) => {
    setImages(images.filter(img => img !== image));
  };
  
  const commonAmenities = [
    "Air Conditioning",
    "Balcony",
    "Gym",
    "Parking",
    "Pool",
    "Elevator",
    "Security",
    "Furnished",
    "Wifi",
    "Laundry",
    "Pet Friendly",
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cozy apartment with city view"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Property Type *</Label>
          <Select value={type} onValueChange={(value) => setType(value as PropertyType)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
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
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property..."
            rows={4}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 1800"
            min="0"
            step="100"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Los Angeles, CA"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="area">Area (sq.ft.) *</Label>
          <Input
            id="area"
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. 900"
            min="0"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms *</Label>
          <Input
            id="bedrooms"
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            placeholder="e.g. 2"
            min="0"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms *</Label>
          <Input
            id="bathrooms"
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            placeholder="e.g. 1"
            min="0"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as PropertyStatus)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={featured}
            onCheckedChange={setFeatured}
          />
          <Label htmlFor="featured">Feature this property on homepage</Label>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Amenities</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center bg-gray-100 rounded-full px-3 py-1"
              >
                <span className="text-sm">{amenity}</span>
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addAmenity}
            >
              Add
            </Button>
          </div>
          
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {commonAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAmenities([...amenities, amenity]);
                    } else {
                      setAmenities(amenities.filter(a => a !== amenity));
                    }
                  }}
                />
                <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Images</Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image} className="relative group">
                <img
                  src={image}
                  alt="Property"
                  className="h-24 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Input
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Enter image URL"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-realestate-primary hover:bg-realestate-secondary"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : initialData ? "Update Property" : "Add Property"}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
