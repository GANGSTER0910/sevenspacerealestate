<<<<<<< HEAD
import { useContext } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> b93f9da577e7261d14a261f45f9b56ef4c66988f
import { useParams } from "react-router-dom";
import { PropertyContext } from "./PropertyContext";
import ExtraImage from "../../assets/Real Estate.jpg";
import "../css/Individual_Property.css";

<<<<<<< HEAD
const Individual_Property = () => {
=======
const API_BASE_URL = "https://sevenspacerealestate.onrender.com"; 

const IndividualProperty = () => {
>>>>>>> b93f9da577e7261d14a261f45f9b56ef4c66988f
  const { id } = useParams();
  const { allProperties, loading } = useContext(PropertyContext);

  if (loading) {
    return <p>Loading property details...</p>;
  }

  const property = allProperties?.find((prop) => prop.id === id);

  if (!property) {
    return <p>Property not found.</p>;
  }

  return (
    <div className="property-detail-container">
      <div className="property-detail-content">
        <h1 className="property-title">{property.property_type} for Rent</h1>
        <div className="property-image-container">
          <img src={property.image || ExtraImage} alt={property.property_type} className="property-image" />
        </div>
        <div className="property-details">
          <h2>{property.description}</h2>
          <p><strong>Price: </strong>₹{property.price}</p>
          <p><strong>Area: </strong>{property.area_sqft ?? "Not specified"} sq.ft.</p>
          <p><strong>Bedrooms: </strong>{property.bedrooms ?? "N/A"}</p>
          <p><strong>Bathrooms: </strong>{property.bathrooms ?? "N/A"}</p>
          <p><strong>Amenities: </strong>{property.amenities?.join(", ") || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default Individual_Property;
