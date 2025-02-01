import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ExtraImage from "../../assets/Real Estate.jpg";
import "../css/Individual_Property.css";

const IndividualProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, type: "Flat", address: "123 Main St, Mumbai, India", price: 500000, area_sqft: 1200, bedrooms: 3, bathrooms: 2, amenities: ["pool", "gym"], image: ExtraImage },
      { id: 2, type: "Flat", address: "456 Park Ave, Delhi, India", price: 600000, area_sqft: 1400, bedrooms: 4, bathrooms: 3, amenities: ["garden", "parking"], image: ExtraImage },
      { id: 3, type: "Apartment", address: "789 Ocean Drive, Chennai, India", price: 700000, area_sqft: 1600, bedrooms: 4, bathrooms: 2, amenities: ["balcony", "security"], image: ExtraImage },
      { id: 4, type: "PG", address: "101 Residency Rd, Bangalore, India", price: 250000, area_sqft: 400, bedrooms: 1, bathrooms: 1, amenities: ["WiFi", "furniture"], image: ExtraImage },
      { id: 5, type: "Hostel", address: "22 University Lane, Pune, India", price: 200000, area_sqft: 350, bedrooms: 1, bathrooms: 1, amenities: ["WiFi", "shared kitchen"], image: ExtraImage },
      { id: 6, type: "Cottage", address: "55 Mountain View, Manali, India", price: 800000, area_sqft: 1800, bedrooms: 3, bathrooms: 2, amenities: ["fireplace", "mountain view"], image: ExtraImage },
      { id: 7, type: "Flat", address: "678 Sunrise Blvd, Kolkata, India", price: 550000, area_sqft: 1300, bedrooms: 3, bathrooms: 2, amenities: ["gym", "swimming pool"], image: ExtraImage },
      { id: 8, type: "Apartment", address: "890 Sunset Road, Hyderabad, India", price: 650000, area_sqft: 1500, bedrooms: 3, bathrooms: 2, amenities: ["balcony", "parking"], image: ExtraImage },
      { id: 9, type: "PG", address: "303 Metro Tower, Ahmedabad, India", price: 220000, area_sqft: 350, bedrooms: 1, bathrooms: 1, amenities: ["WiFi", "common room"], image: ExtraImage },
      { id: 10, type: "Hostel", address: "45 College St, Jaipur, India", price: 180000, area_sqft: 300, bedrooms: 1, bathrooms: 1, amenities: ["WiFi", "laundry"], image: ExtraImage },
      { id: 11, type: "Cottage", address: "99 Lakeside, Udaipur, India", price: 900000, area_sqft: 2000, bedrooms: 3, bathrooms: 3, amenities: ["lake view", "private garden"], image: ExtraImage },
    ];

    const selectedProperty = mockData.find((prop) => prop.id === parseInt(id));
    setProperty(selectedProperty);
  }, [id]);

  return (
    <div className="property-detail-container">
      {property ? (
        <div className="property-detail-content">
          <h1 className="property-title">{property.type} for Rent</h1>
          <div className="property-image-container">
            <img src={property.image} alt={property.type} className="property-image" />
          </div>
          <div className="property-details">
            <h2>{property.address}</h2>
            <p><strong>Price: </strong>₹{property.price}</p>
            <p><strong>Area: </strong>{property.area_sqft} sq.ft.</p>
            <p><strong>Bedrooms: </strong>{property.bedrooms}</p>
            <p><strong>Bathrooms: </strong>{property.bathrooms}</p>
            <p><strong>Amenities: </strong>{property.amenities.join(", ")}</p>
          </div>
        </div>
      ) : (
        <p>Loading property details...</p>
      )}
    </div>
  );
};

export default IndividualProperty;
