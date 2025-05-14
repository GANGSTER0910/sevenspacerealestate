
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Eye, Trash2, CheckCircle } from "lucide-react";
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

// Mock inquiry data
const mockInquiries = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    propertyId: '101',
    propertyTitle: 'Luxury Apartment Downtown',
    message: 'I am interested in viewing this property. When would be a good time?',
    status: 'pending',
    date: '2025-04-09T10:30:00'
  },
  { 
    id: '2', 
    name: 'Sarah Williams', 
    email: 'sarah@example.com', 
    propertyId: '102',
    propertyTitle: 'Modern Condo with City View',
    message: 'Does this property allow pets? I have a small dog.',
    status: 'replied',
    date: '2025-04-08T14:45:00'
  },
  { 
    id: '3', 
    name: 'Michael Brown', 
    email: 'michael@example.com', 
    propertyId: '103',
    propertyTitle: 'Cozy Studio Apartment',
    message: 'Is parking included with this unit?',
    status: 'pending',
    date: '2025-04-08T09:15:00'
  },
  { 
    id: '4', 
    name: 'Emily Johnson', 
    email: 'emily@example.com', 
    propertyId: '104',
    propertyTitle: 'Spacious Family Home',
    message: 'What are the nearby schools in the area?',
    status: 'pending',
    date: '2025-04-07T16:20:00'
  },
  { 
    id: '5', 
    name: 'David Wilson', 
    email: 'david@example.com', 
    propertyId: '105',
    propertyTitle: 'Beach House with Ocean View',
    message: 'Is the property available for the first week of June?',
    status: 'replied',
    date: '2025-04-06T11:10:00'
  },
];

const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredInquiries = inquiries.filter(inquiry => 
    inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setInquiries(inquiries.filter(inquiry => inquiry.id !== id));
  };

  const markAsReplied = (id: string) => {
    setInquiries(inquiries.map(inquiry => 
      inquiry.id === id ? {...inquiry, status: 'replied'} : inquiry
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout title="Inquiries">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No inquiries found
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>{formatDate(inquiry.date)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inquiry.name}</p>
                      <p className="text-sm text-gray-500">{inquiry.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{inquiry.propertyTitle}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {inquiry.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => markAsReplied(inquiry.id)}
                          title="Mark as Replied"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the inquiry
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(inquiry.id)}
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

export default AdminInquiriesPage;
