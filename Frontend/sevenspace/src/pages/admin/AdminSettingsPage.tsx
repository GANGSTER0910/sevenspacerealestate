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
import { useAuth } from "@/contexts/AuthContext";
const url = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
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
  const {user} = useAuth();
  // State for showing loading indicators
  const [isGeneralSaving, setIsGeneralSaving] = useState(false);
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  
  // State for security form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Handle input changes for general settings
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [id]: value }));
  };

  // Handle toggle changes for notification settings
  const handleToggleChange = (id: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [id]: checked }));
  };

  // Handle input changes for security form
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [id]: value }));
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

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecuritySaving(true);

    // Validate new password and confirm password match
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      });
      setIsSecuritySaving(false);
      return;
    }

    try {
      const response = await fetch(`${url}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email : user.email,
          old_password: securityForm.currentPassword,
          new_password: securityForm.newPassword
        })
      });
      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.detail || "Failed to change password.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while changing password.",
        variant: "destructive"
      });
    } finally {
      setIsSecuritySaving(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-1 mb-8">
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
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
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" value={securityForm.currentPassword} onChange={handleSecurityChange} />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" value={securityForm.newPassword} onChange={handleSecurityChange} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" value={securityForm.confirmPassword} onChange={handleSecurityChange} />
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
