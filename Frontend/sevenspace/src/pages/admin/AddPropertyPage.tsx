
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyForm from "@/components/admin/PropertyForm";
import { addProperty } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";

const AddPropertyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (data: any) => {
    setIsLoading(true);
    
    try {
      const newProperty = addProperty(data);
      
      toast({
        title: "Property Added",
        description: "The property has been added successfully.",
      });
      
      navigate("/admin/properties");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the property.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Add New Property">
      <div className="max-w-4xl mx-auto">
        <PropertyForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </AdminLayout>
  );
};

export default AddPropertyPage;
