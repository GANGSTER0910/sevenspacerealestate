import { useContext } from "react";
import { useParams } from "react-router-dom";
import { PropertyContext } from "./PropertyContext";
import ExtraImage from "../../assets/Real Estate.jpg";
import "../css/Individual_Property.css";

const API_BASE_URL = "https://sevenspacerealestate.onrender.com"; 

const IndividualProperty = () => {
  const { id } = useParams();
  const { properties, loading } = useContext(PropertyContext);

  if (loading) {
    return <p className="loading-message">Loading property details...</p>;
  }

  if (!properties || properties.length === 0) {
    return <p className="error-message">No properties available.</p>;
  }

  const property = properties.find((prop) => String(prop.id) === id);

  if (!property) {
    return <p className="error-message">Property not found.</p>;
  }

  return (
    <div className="property-detail-container">
      <div className="property-detail-content">
        <h1 className="property-title">{property.property_type} for Rent</h1>
        
        {/* Property Images */}
        <div className="property-image-container">
          {property.images && property.images.length > 0 ? (
            property.images.map((image, index) => (
              <img 
                key={index} 
                src={`${API_BASE_URL}/uploads/${image}`} 
                alt={property.title} 
                className="property-image"
              />
            ))
          ) : (
            <img src={ExtraImage} alt="Default Property" className="property-image" />
          )}
        </div>

        {/* Property Details */}
        <div className="property-details">
          <h2>{property.title}</h2>
          <p><strong>Description: </strong>{property.description}</p>
          <p><strong>Location: </strong>{property.location}</p>
          <p><strong>Price: </strong>₹{property.price}</p>
          <p><strong>Area: </strong>{property.area_sqft ?? "Not specified"} sq.ft.</p>
          <p><strong>Bedrooms: </strong>{property.bedrooms ?? "N/A"}</p>
          <p><strong>Bathrooms: </strong>{property.bathrooms ?? "N/A"}</p>
          <p><strong>Status: </strong>{property.status}</p>
          <p><strong>Listed Date: </strong>{property.listed_date}</p>
          <p><strong>Amenities: </strong>{property.amenities?.join(", ") || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default IndividualProperty;
