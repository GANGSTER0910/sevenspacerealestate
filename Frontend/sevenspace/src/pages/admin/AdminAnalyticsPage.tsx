
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";

const AdminAnalyticsPage: React.FC = () => {
  return (
    <AdminLayout title="Analytics">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,231</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">132</div>
                <p className="text-xs text-muted-foreground">
                  +10.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">412</div>
                <p className="text-xs text-muted-foreground">
                  +5.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4%</div>
                <p className="text-xs text-muted-foreground">
                  +0.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Traffic</CardTitle>
                <CardDescription>
                  Website traffic over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={[
                    { name: 'Jan', value: 2500 },
                    { name: 'Feb', value: 3200 },
                    { name: 'Mar', value: 4000 },
                    { name: 'Apr', value: 3800 },
                    { name: 'May', value: 4300 },
                    { name: 'Jun', value: 5200 }
                  ]} 
                  xAxis="name"
                  yAxis="value"
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Property Views by Type</CardTitle>
                <CardDescription>
                  Distribution of property views by property type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={[
                    { name: 'Apartments', value: 45 },
                    { name: 'Houses', value: 25 },
                    { name: 'Condos', value: 15 },
                    { name: 'Villas', value: 10 },
                    { name: 'Other', value: 5 }
                  ]} 
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>
                Top performing properties by views and inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={[
                  { name: 'Luxury Apartment', views: 1200, inquiries: 45 },
                  { name: 'Beach House', views: 950, inquiries: 32 },
                  { name: 'City Condo', views: 870, inquiries: 28 },
                  { name: 'Suburban Home', views: 820, inquiries: 24 },
                  { name: 'Downtown Loft', views: 780, inquiries: 22 }
                ]}
                xAxis="name"
                series={['views', 'inquiries']}  
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={[
                  { name: 'Week 1', value: 32 },
                  { name: 'Week 2', value: 40 },
                  { name: 'Week 3', value: 35 },
                  { name: 'Week 4', value: 45 },
                  { name: 'Week 5', value: 55 },
                  { name: 'Week 6', value: 60 },
                  { name: 'Week 7', value: 52 },
                  { name: 'Week 8', value: 58 }
                ]} 
                xAxis="name"
                yAxis="value"
                className="h-[300px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Analytics</CardTitle>
              <CardDescription>
                Inquiry trends and response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={[
                  { name: 'Jan', inquiries: 45, responseTime: 12 },
                  { name: 'Feb', inquiries: 52, responseTime: 10 },
                  { name: 'Mar', inquiries: 48, responseTime: 8 },
                  { name: 'Apr', inquiries: 61, responseTime: 9 },
                  { name: 'May', inquiries: 55, responseTime: 7 },
                  { name: 'Jun', inquiries: 67, responseTime: 6 }
                ]}
                xAxis="name"
                series={['inquiries', 'responseTime']}  
                className="h-[300px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
