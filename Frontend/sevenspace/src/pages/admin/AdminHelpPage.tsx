
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, HelpCircle, FileText, Headphones, BookOpen } from "lucide-react";

const AdminHelpPage: React.FC = () => {
  return (
    <AdminLayout title="Help & Support">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
          {/* <p className="text-gray-500 mb-6">Search our knowledge base or browse the topics below</p> */}
          
          {/* <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search help articles..." className="pl-10" />
          </div> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Read our detailed guides and documentation</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">View Documentation</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <Headphones className="h-6 w-6 text-green-700" />
              </div>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-purple-700" />
              </div>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Watch tutorials and learn</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">Watch Tutorials</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I add a new property?</AccordionTrigger>
              <AccordionContent>
                To add a new property, navigate to the Properties section from the sidebar, then click on the "Add Property" button. Fill out the property details in the form and click "Save" to add the new property to your listings.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How can I edit user permissions?</AccordionTrigger>
              <AccordionContent>
                To edit user permissions, go to the Users section, find the user you want to modify, and click on the edit icon. From there, you can change their role and permissions. Remember to save your changes.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I respond to property inquiries?</AccordionTrigger>
              <AccordionContent>
                You can respond to property inquiries by going to the Inquiries section. Click on the view icon next to the inquiry you want to respond to. Type your response in the message box and click "Send". The system will automatically mark the inquiry as "Replied".
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I export property data?</AccordionTrigger>
              <AccordionContent>
                Yes, you can export property data. In the Properties section, look for the "Export" button in the top right corner. You can choose to export all properties or filter them before exporting. The data can be exported in CSV, Excel, or PDF format.
              </AccordionContent>
            </AccordionItem>
            
            {/* <AccordionItem value="item-5">
              <AccordionTrigger>How do I change system settings?</AccordionTrigger>
              <AccordionContent>
                To change system settings, navigate to the Settings section from the sidebar. Here you can modify general settings, notification preferences, security settings, and more. Remember to save your changes after making modifications.
              </AccordionContent>
            </AccordionItem> */}
          </Accordion>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
            <CardDescription>
              Contact our support team directly and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Input placeholder="Your name" />
              </div>
              <div>
                <Input type="email" placeholder="Your email" />
              </div>
              <div>
                <Input placeholder="Subject" />
              </div>
              <div>
                <textarea 
                  className="w-full p-2 border rounded-md h-32" 
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>
              <Button className="bg-realestate-primary hover:bg-realestate-secondary">
                <Mail className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHelpPage;
