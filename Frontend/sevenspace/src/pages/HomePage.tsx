import React from "react";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import PropertyTypeSection from "@/components/home/PropertyTypeSection";
import PropertyGrid from "@/components/property/PropertyGrid";
import { useProperties } from "@/services/property.service";
import { Property } from "@/types/property";

const HomePage: React.FC = () => {
  const { data, isLoading, isError } = useProperties({ limit: 8, sortBy: 'listed_date' });

  const featuredProperties: Property[] = data?.properties || [];
  
  if (isLoading) {
    return <Layout><p>Loading featured properties...</p></Layout>;
  }

  if (isError) {
    return <Layout><p>Error loading featured properties.</p></Layout>;
  }

  return (
    <Layout>
      <Hero />
      
      <PropertyTypeSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid 
          properties={featuredProperties}
          title="Featured Properties"
        />
        
        <div className="py-16 px-4 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose SevenSpace?</h2>
            <p className="mt-4 text-lg text-gray-500">
              We are committed to finding the perfect space for you.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-realestate-primary rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Wide Range of Properties
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    From luxury apartments to affordable PGs, find the perfect property that fits your budget and lifestyle.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-realestate-primary rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Fast & Efficient Service
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Our expert team ensures a smooth and hassle-free experience from search to move-in.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-realestate-primary rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Trusted by Thousands
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Join the community of satisfied customers who found their perfect space with us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
