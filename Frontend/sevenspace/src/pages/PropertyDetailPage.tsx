import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { getPropertyById } from "@/services/propertyService";
import { toast } from "sonner";
import { MapPin, Bed, Bath, Square, Heart, Share, Calendar, User } from "lucide-react";
import { propertyService, Property } from '@/services/property.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

const url = process.env.url || 'http://localhost:8000';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuth();
  
  // Add loading states for buttons
  const [isContactLoading, setIsContactLoading] = React.useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  // Add state to track if the property is favorited
  const [isFavorited, setIsFavorited] = React.useState(false);
  
  const checkFavoriteStatus = async (propertyId: string) => {
    try {
      const response = await fetch(`${url}/property_service/property/${propertyId}/favorite`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Assuming the backend returns a JSON body like { isFavorited: true/false }
        const data = await response.json();
        setIsFavorited(data.isFavorited || false);
      } else if (response.status === 404) {
        // Not found means it's not favorited
        setIsFavorited(false);
        navigate('/login'); // Redirect to login if not found
      } else {
        console.error('Failed to check favorite status:', response.status, response.statusText);
        setIsFavorited(false); // Assume not favorited on other errors
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
      setIsFavorited(false); // Assume not favorited on fetch errors
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) throw new Error('Property ID is required');
        const data = await propertyService.getById(id);
        if (!data) {
          throw new Error('Property not found');
        }
        setProperty(data);
        // After fetching property, check if it's favorited by the current user
        await checkFavoriteStatus(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
        toast.error("Failed to load property details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error || 'Property not found'}</div>
      </div>
    );
  }
  
  const handleContactAgent = async () => {
    try {
      // Check authentication first
      const authResponse = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please login to contact the agent");
        navigate('/login');
        return;
      }

      setIsContactLoading(true);
      // Redirect to contact page with property details
      navigate('/contact', { 
        state: { 
          propertyId: id,
          propertyTitle: property?.title,
          propertyPrice: property?.price
        }
      });
    } catch (error) {
      console.error('Contact agent error:', error);
      toast.error("Failed to process your request. Please try again.");
    } finally {
      setIsContactLoading(false);
    }
  };
  
  const handleAddToFavorites = async () => {
    try {
      // Check authentication first
      const authResponse = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please login to save properties");
        navigate('/login');
        return;
      }

      setIsFavoriteLoading(true);
      
      if (isFavorited) {
        // Remove from favorites
        console.log('Attempting to remove from favorites:', `${url}/property_service/property/${id}/favorite`);
        const response = await fetch(`${url}/property_service/property/${id}/favorite`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (!response.ok) {
          console.error('Failed to remove from favorites:', response.status, response.statusText);
          throw new Error('Failed to remove from favorites');
        }
        
        setIsFavorited(false);
        toast.success("Property removed from favorites");
      } else {
        // Add to favorites
        console.log('Attempting to add to favorites:', `${url}/property/${id}/favorite`);
        const response = await fetch(`${url}/property_service/property/${id}/favorite`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',

          }
        });
        
        if (!response.ok) {
          console.error('Failed to add to favorites:', response.status, response.statusText);
          throw new Error('Failed to add to favorites');
        }
        
        setIsFavorited(true);
        toast.success("Property added to favorites");
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  
  const handleShare = async () => {
    try {
      // Get the current URL
      const shareUrl = window.location.href;
      
      // Try to use the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Failed to copy text: ', err);
          throw new Error('Failed to copy link');
        }
        
        document.body.removeChild(textArea);
      }
      
      // Show success toast
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error('Share error:', error);
      toast.error("Failed to copy link. Please try again.");
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-5 w-5 text-realestate-primary mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <img
                  src={property.images[0] || "https://via.placeholder.com/800x500"}
                  alt={property.title}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
              {property.images.slice(1, 5).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.title} view ${index + 2}`}
                  className="w-full h-[200px] object-cover rounded-lg"
                />
              ))}
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Bed className="h-5 w-5 text-realestate-primary mb-2" />
                    <div className="text-sm text-gray-500">Bedrooms</div>
                    <div className="font-semibold">{property.bedrooms}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Bath className="h-5 w-5 text-realestate-primary mb-2" />
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <div className="font-semibold">{property.bathrooms}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Square className="h-5 w-5 text-realestate-primary mb-2" />
                    <div className="text-sm text-gray-500">Area</div>
                    <div className="font-semibold">{property.area_sqft} sq.ft.</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Calendar className="h-5 w-5 text-realestate-primary mb-2" />
                    <div className="text-sm text-gray-500">Listed Date</div>
                    <div className="font-semibold">{property.listed_date}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{property.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="mt-4">
                <h3 className="text-xl font-semibold mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <div className="h-2 w-2 bg-realestate-primary rounded-full mr-2"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="mt-4">
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                <div className="bg-gray-100 rounded-lg h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Map view would be displayed here</p>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Neighborhood</h4>
                  <p className="text-gray-600">
                    This property is located in a vibrant neighborhood with easy access to schools, 
                    shopping centers, and public transportation.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-2xl font-bold text-realestate-primary mb-2">
                {formatPrice(property.price)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {property.property_type === 'pg' || property.property_type === 'hostel' ? '/month' : ''}
                </span>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleContactAgent}
                  className="w-full bg-realestate-primary hover:bg-realestate-secondary"
                  disabled={isContactLoading}
                >
                  {isContactLoading ? "Sending..." : "Contact Agent"}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className={`flex-1 ${isFavorited ? 'border-red-300' : ''}`}
                    onClick={handleAddToFavorites}
                    disabled={isFavoriteLoading}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-[#ea384c] text-[#ea384c]' : ''}`} 
                    />
                    {isFavoriteLoading ? "Saving..." : isFavorited ? "Saved" : "Save"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <div className="flex items-start space-x-3">
                  <User className="h-10 w-10 text-gray-400 bg-gray-100 p-2 rounded-full" />
                  <div>
                    <h4 className="font-medium">Get More Information</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Our team is ready to answer any questions you have about this property.
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-realestate-primary hover:bg-transparent hover:underline"
                        onClick={handleContactAgent}
                      >
                        Schedule a Viewing
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetailPage;
