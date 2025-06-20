import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Clock, MessageSquare, Home, Settings, User } from "lucide-react";
import { toast } from "sonner";

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

interface UserProfile {
  email: string;
  role: string;
  name?: string;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000' || 'https://sevenspacerealestate.onrender.com';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isLoadingMyProperties, setIsLoadingMyProperties] = useState(false);
  
  // Add form state
  const [profileForm, setProfileForm] = useState({
    name: (user as UserProfile)?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: ""
  });
  
  // Add password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Add notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    propertyUpdates: true,
    marketing: false
  });
  
  // Add loading states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch current user profile details
  const fetchProfileDetails = async () => {
    try {
      setIsProfileLoading(true);
      const response = await fetch(`${API_URL}/auth_service/user/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      const userDetails = data.user;
      setProfileForm(prev => ({
        ...prev,
        name: userDetails.name || '',
        email: userDetails.email || '',
        phone: userDetails.phone ? String(userDetails.phone) : '',
        location: userDetails.location || '',
        bio: userDetails.bio || '',
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "favorites") {
      fetchFavorites();
    }
    if (activeTab === "properties") {
      fetchMyProperties();
    }
    if (activeTab === "profile") {
      fetchProfileDetails();
    }
  }, [activeTab]);

const fetchFavorites = async () => {
  try {
    setIsLoadingFavorites(true);
    
    // First, get the list of favorite IDs
    const response = await fetch(`${API_URL}/property_service/property/favorites`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    const data = await response.json();
    console.log(data);
    // const propertyIds = data.favorites;
    setFavorites(data.favorites );
    
  } catch (error) {
    console.error('Error fetching favorites:', error);
    toast.error("Failed to load favorites");
  } finally {
    setIsLoadingFavorites(false);
  }
};

// Fetch properties listed by the current user
const fetchMyProperties = async () => {
  try {
    setIsLoadingMyProperties(true);
    const response = await fetch(`${API_URL}/property_service/property/my`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your properties');
    }

    const data = await response.json();
    setMyProperties(data.properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    toast.error('Failed to load your properties');
  } finally {
    setIsLoadingMyProperties(false);
  }
};

const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`${API_URL}/property_service/property/${propertyId}/favorite`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
    return price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  if (!user) {
    return null;
  }

  const handleContactAgent = () => {
    toast.success("Request Sent", {
      description: "An agent will contact you shortly."
    });
  };
  
  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [id]: value }));
  };
  
  // Handle notification preferences change
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setNotificationPrefs(prev => ({ ...prev, [id]: checked }));
  };
  
  // Handle profile save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);

    try {
      // Prepare payload, omitting phone if blank to satisfy backend validation
      const payload: Record<string, any> = {
        name: profileForm.name,
        email: profileForm.email,
        location: profileForm.location,
        bio: profileForm.bio,
      };

      if (profileForm.phone.trim() !== '') {
        const phoneNumber = Number(profileForm.phone);
        if (!isNaN(phoneNumber)) {
          payload.phone = phoneNumber;
        }
      }

      const response = await fetch(`${API_URL}/auth_service/user/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const result = await response.json();

      // Update form with returned values
      if (result.user) {
        const u = result.user;
        setProfileForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone ? String(u.phone) : '',
          location: u.location || '',
          bio: u.bio || '',
        });
      }

      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Update Failed', {
        description: error?.message || 'Failed to update profile',
      });
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Password Error', { description: 'All password fields are required.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password Error', { description: 'New password and confirmation do not match.' });
      return;
    }

    setIsPasswordSaving(true);

    try {
      const response = await fetch(`${API_URL}/auth_service/user/change-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          old_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password');
      }

      toast.success('Password Updated', { description: 'Your password has been changed successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Update Failed', { description: error.message || 'Failed to change password' });
    } finally {
      setIsPasswordSaving(false);
    }
  };
  
  // Handle notification preferences save
  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Preferences Saved", {
        description: "Your notification preferences have been updated."
      });
      setIsNotificationsSaving(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {(user as UserProfile)?.name || user.email}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-1">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant={activeTab === "properties" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("properties")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  My Properties
                </Button>
                <Button 
                  variant={activeTab === "favorites" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("favorites")}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
                <Button 
                  variant={activeTab === "messages" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("messages")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
                <Button 
                  variant={activeTab === "settings" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <p className="text-sm text-gray-500 mb-4">
                Contact our support team or request a call from an agent.
              </p>
              <Button onClick={handleContactAgent} className="bg-realestate-primary hover:bg-realestate-secondary">
                Contact Agent
              </Button>
            </CardContent>
          </Card>
        </aside>

        <main className="md:w-3/4">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>View and edit your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        name="location"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={profileForm.location}
                        onChange={handleProfileChange}
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us a bit about yourself"
                    ></textarea>
                  </div>
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="bg-realestate-primary hover:bg-realestate-secondary"
                      disabled={(isProfileSaving || isProfileLoading) ? true : false}
                    >
                      {(isProfileSaving || isProfileLoading) ? "Loading..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "properties" && (
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>Your listed properties</CardDescription>
                </div>
                <Button
                  className="mt-4 md:mt-0 bg-realestate-primary hover:bg-realestate-secondary"
                  onClick={() => navigate('/user/add-property')}
                >
                  List a Property
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingMyProperties ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : myProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myProperties.map((property) => (
                      <Card key={property._id}>
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={property.images[0] || 'https://via.placeholder.com/400x300'}
                              alt={property.title}
                              className="h-48 w-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold capitalize">{property.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{property.location}</p>
                            <p className="font-bold mt-2">{formatPrice(property.price)}</p>
                            <div className="mt-4 flex space-x-2">
                              <Link to={`/property/${property._id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <>
              <h3 className="text-lg font-semibold mb-4">Your Favorite Properties</h3>
              {isLoadingFavorites ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't saved any properties yet.</p>
                  <Button 
                    onClick={() => window.location.href = '/property'}
                    className="bg-realestate-primary hover:bg-realestate-secondary"
                  >
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((property) => (
                    <Card key={property._id}>
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={property.images[0] || "https://via.placeholder.com/400x300"}
                            alt={property.title}
                            className="h-48 w-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white rounded-full"
                            onClick={() => handleRemoveFavorite(property._id)}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold">{property.title}</h4>
                          <p className="text-sm text-gray-500">{property.location}</p>
                          <p className="font-bold mt-2">{formatPrice(property.price)}</p>
                          <div className="mt-4 flex space-x-2">
                            <Link to={`/property/${property._id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => window.location.href = `/contact?propertyId=${property._id}`}
                            >
                              Contact Agent
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "messages" && (
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Your conversations with agents and property owners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="border-b pb-4">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Agent {item === 1 ? "Sarah Johnson" : "Mike Thompson"}</h4>
                          <p className="text-sm text-gray-500">Re: {item === 1 ? "Downtown Apartment Viewing" : "Beachside Property Question"}</p>
                        </div>
                        <span className="text-xs text-gray-400">{item === 1 ? "Today" : "Yesterday"}</span>
                      </div>
                      <p className="text-sm">
                        {item === 1 ? 
                          "I'd be happy to schedule a viewing for you this weekend. Does Saturday at 2pm work for you?" : 
                          "Yes, the property comes with 2 dedicated parking spaces and guest parking is available."}
                      </p>
                      <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-realestate-primary">Reply</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Password</h4>
                    <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div>
                        <Button 
                          type="submit" 
                          className="mt-2 bg-realestate-primary hover:bg-realestate-secondary"
                          disabled={isPasswordSaving}
                        >
                          {isPasswordSaving ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  </div>

                  <hr />

                  <div>
                    <h4 className="font-medium mb-2">Notification Preferences</h4>
                    <form onSubmit={handlePreferencesSave} className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="emailNotifications"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={notificationPrefs.emailNotifications}
                          onChange={handleNotificationChange}
                        />
                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                          Email Notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="propertyUpdates"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={notificationPrefs.propertyUpdates}
                          onChange={handleNotificationChange}
                        />
                        <label htmlFor="propertyUpdates" className="ml-2 block text-sm text-gray-700">
                          Property Updates
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="marketing"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={notificationPrefs.marketing}
                          onChange={handleNotificationChange}
                        />
                        <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                          Marketing and Promotions
                        </label>
                      </div>
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="bg-realestate-primary hover:bg-realestate-secondary"
                          disabled={isNotificationsSaving}
                        >
                          {isNotificationsSaving ? "Saving..." : "Save Preferences"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recommended Properties</CardTitle>
                <CardDescription>Based on your preferences and search history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex space-x-4">
                      <img
                        src="/lovable-uploads/54bf8a19-b756-4f09-b13e-93f23aae4b85.png"
                        alt="Property"
                        className="h-24 w-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">Spacious Studio Apartment</h4>
                        <p className="text-sm text-gray-500">Chicago, IL</p>
                        <p className="text-sm font-semibold mt-1">$1,800/month</p>
                        <Link to="/property/3" className="text-realestate-primary text-sm hover:underline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
