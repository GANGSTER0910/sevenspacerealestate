import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ExtraImage from "../../assets/Real Estate.jpg";
import "../css/Individual_Property.css";

const API_BASE_URL = "https://sevenspacerealestate.onrender.com"; 

const IndividualProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/property/${id}`);
        const data = await response.json();
        setProperty(data.property || null);
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return <p>Loading property details...</p>;
  }

  if (!property) {
    return <p>Property not found.</p>;
  }

  return (
    <div className="property-detail-container">
      <div className="property-detail-content">
        <h1 className="property-title">{property.type} for Rent</h1>
        <div className="property-image-container">
          <img src={property.image || ExtraImage} alt={property.type} className="property-image" />
        </div>
        <div className="property-details">
          <h2>{property.address}</h2>
          <p><strong>Price: </strong>₹{property.price}</p>
          <p><strong>Area: </strong>{property.area_sqft} sq.ft.</p>
          <p><strong>Bedrooms: </strong>{property.bedrooms}</p>
          <p><strong>Bathrooms: </strong>{property.bathrooms}</p>
          <p><strong>Amenities: </strong>{property.amenities?.join(", ") || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default IndividualProperty;
