
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Clock, MessageSquare, Home, Settings, User } from "lucide-react";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Add form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
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

  if (!user) {
    return null;
  }

  const handleContactAgent = () => {
    toast({
      title: "Request Sent",
      description: "An agent will contact you shortly.",
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
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsProfileSaving(false);
    }, 1000);
  };
  
  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Error",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsPasswordSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setIsPasswordSaving(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }, 1000);
  };
  
  // Handle notification preferences save
  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
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
                {user.name}
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
                      disabled={isProfileSaving}
                    >
                      {isProfileSaving ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "properties" && (
            <Card>
              <CardHeader>
                <CardTitle>My Properties</CardTitle>
                <CardDescription>Properties you've listed or saved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
                  <Button className="bg-realestate-primary hover:bg-realestate-secondary">
                    List a Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <>
              <h3 className="text-lg font-semibold mb-4">Your Favorite Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((item) => (
                  <Card key={item}>
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src="/lovable-uploads/5f8c14d4-6d14-4ff2-8844-b9bfecf97271.png"
                          alt="Property"
                          className="h-48 w-full object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white rounded-full"
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold">Modern Apartment with City View</h4>
                        <p className="text-sm text-gray-500">Los Angeles, CA</p>
                        <p className="font-bold mt-2">$2,500/month</p>
                        <div className="mt-4 flex space-x-2">
                          <Link to="/property/1">
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                          <Button variant="secondary" size="sm" onClick={handleContactAgent}>Contact Agent</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
