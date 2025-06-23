import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";

interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  property_type: string;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  listed_date: string;
  status: string;
}
const url = import.meta.env.VITE_PROPERTY_URL || 'http://localhost:8000/property_service';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const authResponse = await checkAuth();
        if (!isAuthenticated) {
          toast.error("Please login to view favorites");
          navigate('/login');
          return;
        }

        const response = await fetch(`${url}/property/favorites`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data.favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, checkAuth, navigate]);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`${url}/property/${propertyId}/favorite`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      setFavorites(favorites.filter(property => property._id !== propertyId));
      toast.success("Property removed from favorites");
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error("Failed to remove from favorites");
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorite Properties</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You haven't saved any properties yet.</p>
            <Button
              onClick={() => navigate('/property')}
              className="mt-4 bg-realestate-primary hover:bg-realestate-secondary"
            >
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <Card key={property._id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={property.images[0] || "https://via.placeholder.com/400x300"}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveFavorite(property._id)}
                  >
                    <Heart className="h-5 w-5 fill-[#ea384c] text-[#ea384c]" />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{property.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-realestate-primary mb-4">
                    {formatPrice(property.price)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} beds
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} baths
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.area_sqft} sq.ft
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/property/${property._id}`)}
                    className="w-full mt-4 bg-realestate-primary hover:bg-realestate-secondary"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage; 