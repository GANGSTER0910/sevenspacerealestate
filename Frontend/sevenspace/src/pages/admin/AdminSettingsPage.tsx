
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const AdminSettingsPage: React.FC = () => {
  // Get the toast hook for notifications
  const { toast } = useToast();
  
  // State for general settings form
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "SevenSpace Real Estate",
    siteDescription: "Find your perfect property with SevenSpace Real Estate.",
    contactEmail: "contact@sevenspace.com",
    contactPhone: "+1 (555) 123-4567",
    metaTitle: "SevenSpace | Premium Real Estate",
    metaDescription: "Find your dream property with SevenSpace, offering premium apartments, houses, and commercial spaces.",
    metaKeywords: "real estate, property, home, apartment, house, rent, buy"
  });

  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newInquiry: true,
    newUser: true,
    propertyUpdates: false,
    dailySummary: true,
    importantAlerts: true
  });

  // State for showing loading indicators
  const [isGeneralSaving, setIsGeneralSaving] = useState(false);
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  
  // Handle input changes for general settings
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [id]: value }));
  };

  // Handle toggle changes for notification settings
  const handleToggleChange = (id: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneralSaving(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "General settings have been saved successfully.",
      });
      setIsGeneralSaving(false);
    }, 1000);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationsSaving(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "Notification settings have been saved successfully.",
      });
      setIsNotificationsSaving(false);
    }, 1000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecuritySaving(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "Security settings have been saved successfully.",
      });
      setIsSecuritySaving(false);
    }, 1000);
  };

  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your site details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Site Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input 
                        id="siteName" 
                        value={generalSettings.siteName} 
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea 
                        id="siteDescription" 
                        value={generalSettings.siteDescription}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input 
                        id="contactEmail" 
                        type="email" 
                        value={generalSettings.contactEmail}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input 
                        id="contactPhone" 
                        value={generalSettings.contactPhone}
                        onChange={handleGeneralChange}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SEO Settings</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="metaTitle">Default Meta Title</Label>
                      <Input 
                        id="metaTitle" 
                        value={generalSettings.metaTitle}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Default Meta Description</Label>
                      <Textarea 
                        id="metaDescription" 
                        value={generalSettings.metaDescription}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaKeywords">Default Meta Keywords</Label>
                      <Input 
                        id="metaKeywords" 
                        value={generalSettings.metaKeywords}
                        onChange={handleGeneralChange}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-realestate-primary hover:bg-realestate-secondary"
                  disabled={isGeneralSaving}
                >
                  {isGeneralSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newInquiry">New Inquiry</Label>
                        <p className="text-sm text-gray-500">Receive an email when a new property inquiry is submitted</p>
                      </div>
                      <Switch 
                        id="newInquiry" 
                        checked={notificationSettings.newInquiry}
                        onCheckedChange={(checked) => handleToggleChange("newInquiry", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newUser">New User Registration</Label>
                        <p className="text-sm text-gray-500">Receive an email when a new user registers</p>
                      </div>
                      <Switch 
                        id="newUser" 
                        checked={notificationSettings.newUser}
                        onCheckedChange={(checked) => handleToggleChange("newUser", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="propertyUpdates">Property Updates</Label>
                        <p className="text-sm text-gray-500">Receive an email when properties are updated</p>
                      </div>
                      <Switch 
                        id="propertyUpdates"
                        checked={notificationSettings.propertyUpdates}
                        onCheckedChange={(checked) => handleToggleChange("propertyUpdates", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dailySummary">Daily Summary</Label>
                        <p className="text-sm text-gray-500">Receive a daily summary of activities</p>
                      </div>
                      <Switch 
                        id="dailySummary" 
                        checked={notificationSettings.dailySummary}
                        onCheckedChange={(checked) => handleToggleChange("dailySummary", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="importantAlerts">Important Alerts</Label>
                        <p className="text-sm text-gray-500">Receive notifications for important system alerts</p>
                      </div>
                      <Switch 
                        id="importantAlerts" 
                        checked={notificationSettings.importantAlerts}
                        onCheckedChange={(checked) => handleToggleChange("importantAlerts", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-realestate-primary hover:bg-realestate-secondary"
                  disabled={isNotificationsSaving}
                >
                  {isNotificationsSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSecurity} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="two-factor" />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Active Sessions</p>
                        <p className="text-sm text-gray-500">You are currently logged in from 1 device</p>
                      </div>
                      <Button variant="outline">View All Sessions</Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-realestate-primary hover:bg-realestate-secondary"
                  disabled={isSecuritySaving}
                >
                  {isSecuritySaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
