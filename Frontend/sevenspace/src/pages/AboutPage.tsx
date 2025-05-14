
import React from "react";
import Layout from "@/components/layout/Layout";

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">About SevenSpace</h1>
          <p className="mt-4 text-lg text-gray-500">
            A premier real estate company committed to creating exceptional living and investment opportunities.
          </p>
        </div>

        <div className="mt-12 prose prose-lg max-w-none text-gray-600">
          <p>
            Welcome to SevenSpace, a premier real estate company committed to creating exceptional living and investment opportunities. With a passion for excellence, we specialize in offering a diverse portfolio of properties that cater to the unique needs of each client. From residential homes that embody comfort and style to high-end commercial spaces that foster business growth, SevenSpace ensures that every space we represent is more than just a structure—it's a place to call home or grow your business.
          </p>
          
          <p>
            Our experienced team of real estate professionals is driven by a shared vision of providing personalized service, innovative solutions, and unmatched market insight. We understand that buying, selling, or investing in real estate can be a life-changing decision, and we are here to guide you every step of the way. Whether you're looking to invest in your first home, expand your business, or diversify your property portfolio, SevenSpace is your trusted partner. With a focus on integrity, transparency, and customer satisfaction, we aim to build long-lasting relationships that go beyond transactions. Let SevenSpace help you unlock the door to your next great opportunity.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Board of Directors</h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  <img 
                    className="h-32 w-32 object-cover rounded-lg"
                    src="/lovable-uploads/7fedded5-483a-40cf-9754-217d91d099b3.png"
                    alt="Mr. Harsh Panchal"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mr. Harsh Panchal</h3>
                  <p className="text-sm text-gray-500">FOUNDER & MANAGING DIRECTOR</p>
                  <p className="mt-2 text-gray-700">BTech</p>
                  <p className="mt-2 text-gray-600">
                    The proud owner and managing director of the City Estate Management, Founder – President of Ahmedabad Realtors Association and Ex-Vice President of NAR, India & Chairman (PR & Communication) of NAR, India being first in this service industry builds professionalism and creates a corporate culture in Real Estate Consulting Business. He leads strategic planning and corporate development across the group's portfolio of real estate businesses. He is leading teams across client services, projects, editorial and marketing.
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

export default AboutPage;
