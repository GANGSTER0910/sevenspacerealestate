import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { propertyService } from "@/services/property.service";
import { Property } from "@/types/property";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { saveAs } from "file-saver";

// Utility to convert array of objects to CSV
function convertToCSV(arr: any[]) {
  if (!arr.length) return '';
  const header = Object.keys(arr[0]);
  const csvRows = [header.join(",")];
  for (const row of arr) {
    const values = header.map(field => {
      let value = row[field];
      if (Array.isArray(value)) value = value.join("; ");
      if (typeof value === "object" && value !== null) value = JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

const AdminPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getAll();
      setProperties(response.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    try {
      await propertyService.delete(propertyId);
      setProperties(properties.filter(property => property._id !== propertyId));
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (propertyId: string) => {
    navigate(`/admin/properties/edit/${propertyId}`);
  };

  const handleAdd = () => {
    navigate('/admin/properties/add');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleExport = () => {
    if (!properties.length) {
      toast({
        title: "No properties to export",
        description: "There are no properties to export.",
        variant: "destructive"
      });
      return;
    }
    // Prepare a flat version of properties for CSV
    const flatProps = properties.map(({ images, amenities, features, ...rest }) => ({
      ...rest,
      images: images?.join('; '),
      amenities: amenities?.join('; '),
      features: features?.join('; ')
    }));
    const csv = convertToCSV(flatProps);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "properties_export.csv");
  };

  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  return (
    <AdminLayout title="Properties">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAdd}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
          <Button 
            onClick={handleExport}
            className="bg-realestate-primary hover:bg-realestate-secondary"
          >
            Export Properties
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading properties...
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No properties found
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <img
                        src={property.images[0] || "https://via.placeholder.com/50"}
                        alt={property.title}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                      <span className="truncate max-w-xs">{property.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{property.property_type}</span>
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{formatPrice(property.price)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${property.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                      ${property.status === 'rented' ? 'bg-blue-100 text-blue-800' : ''}
                      ${property.status === 'sold' ? 'bg-purple-100 text-purple-800' : ''}
                      ${property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/property/${property._id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(property._id)}
                      >
                          <Edit className="h-4 w-4" />
                        </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the property
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(property._id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminPropertiesPage;
