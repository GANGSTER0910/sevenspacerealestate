import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Eye, Trash2, CheckCircle, Edit } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  content: string;
  created_date: string;
}
const url = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:8000';

const AdminInquiriesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [responseForm, setResponseForm] = useState<ContactMessage | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${url}/contact/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMessages = messages.filter(message => 
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (email: string) => {
  try {
    const response = await fetch(`${url}/contact/messages/${email}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error("Failed to delete message");
    }
    
    // Move this inside the try block after successful API call
    setMessages(messages.filter(message => message.email !== email));
    toast({
      title: "Success",
      description: "Message deleted successfully",
    });
  } catch (error) {
    // Add proper error handling
    toast({
      title: "Error",
      description: "Failed to delete message. Please try again.",
      variant: "destructive",
    });
  }
};

  const handleEditClick = (message: ContactMessage, index: number) => {
    setResponseForm({ ...message });
    setOpenDialogIndex(index);
  };

  const handleResponseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!responseForm) return;
    const { id, value } = e.target;
    setResponseForm(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    if (!responseForm) return;
    try {
      const payload = {
        name: responseForm.name,
        email: responseForm.email,
        subject: responseForm.subject,
        content: responseForm.content,
      };
      const response = await fetch(`${url}/response/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to send response');
      }
      toast({
        title: "Response sent!",
        description: "Your response has been sent to the user.",
      });
      setOpenDialogIndex(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
const handleExport = () => {
    if (!messages.length) {
      toast({
        title: "No properties to export",
        description: "There are no properties to export.",
        variant: "destructive"
      });
      return;
    }
    // Prepare a flat version of properties for CSV
    const flatProps = messages.map(({name, email, subject, content }) => ({
      // ...rest,
      name: name,
      email: email,
      subject: subject,
      content: content
    }));
    const csv = convertToCSV(flatProps);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "inquires_export.csv");
  };
  return (
    <AdminLayout title="Inquires">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      {/* </div> */}
      <div className="flex gap-2">
        <Button 
          onClick={handleExport}
          variant="outline"
          className="bg-realestate-primary hover:bg-realestate-secondary text-white"
        >
          Export Messages
        </Button>
      </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading messages...
                </TableCell>
              </TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(message.created_date)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-gray-500">{message.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell className="max-w-xs truncate">{message.content}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog open={openDialogIndex === index} onOpenChange={open => { if (!open) setOpenDialogIndex(null); }}>
                        <Button variant="ghost" size="icon" title="Respond to Inquiry" onClick={() => handleEditClick(message, index)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Respond to Inquiry</DialogTitle>
                            <DialogDescription>Send a response to the user for this inquiry.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSendResponse} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                <Input id="name" value={responseForm?.name || ''} onChange={handleResponseInputChange} required />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                <Input id="email" type="email" value={responseForm?.email || ''} onChange={handleResponseInputChange} required />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                              <Input id="subject" value={responseForm?.subject || ''} onChange={handleResponseInputChange} required />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="content" className="text-sm font-medium">Message</label>
                              <Textarea id="content" value={responseForm?.content || ''} onChange={handleResponseInputChange} required className="min-h-[120px]" />
                            </div>
                            <DialogFooter>
                              <Button type="submit" className="bg-realestate-primary text-white" disabled={isSending}>
                                {isSending ? "Sending..." : "Send Response"}
                              </Button>
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                              </DialogClose>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
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
                              This action cannot be undone. This will permanently delete the message
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(message.email)}
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
