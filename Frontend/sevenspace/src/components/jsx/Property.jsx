import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { PropertyContext } from "./PropertyContext"; // Import PropertyContext
import "../css/Property.css"; 

const Property = () => {
  const { properties } = useContext(PropertyContext);
  const [filters, setFilters] = useState({
    type: "All",
    priceRange: "All",
    bedrooms: "All",
    bathrooms: "All",
  });
  const [property, setProperties] = useState([]); 
  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    const filtered = properties.filter((prop) => {
      return (
        (filters.type === "All" || prop.property_type === filters.type) &&
        (filters.priceRange === "All" || checkPriceRange(prop.price, filters.priceRange)) &&
        (filters.bedrooms === "All" || prop.bedrooms?.toString() === filters.bedrooms) &&
        (filters.bathrooms === "All" || prop.bathrooms?.toString() === filters.bathrooms)
      );
    });

    setFilteredProperties(filtered);
  }, [filters, properties]);

  const checkPriceRange = (price, range) => {
    switch (range) {
      case "Under 3L":
        return price < 300000;
      case "3L-6L":
        return price >= 300000 && price <= 600000;
      case "Above 6L":
        return price > 600000;
      default:
        return true;
    }
  };

  return (
    <div className="property-container">
      <h1>Available Properties</h1>
      
      {/* Filters UI */}
      <div className="filters">
        <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="All">All Types</option>
          <option value="Flat">Flat</option>
          <option value="Apartment">Apartment</option>
          <option value="PG">PG</option>
          <option value="Hostel">Hostel</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}>
          <option value="All">All Price Ranges</option>
          <option value="Under 3L">Under 3L</option>
          <option value="3L-6L">3L-6L</option>
          <option value="Above 6L">Above 6L</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}>
          <option value="All">All Bedrooms</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4">4+ Bedrooms</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}>
          <option value="All">All Bathrooms</option>
          <option value="1">1 Bathroom</option>
          <option value="2">2 Bathrooms</option>
          <option value="3">3+ Bathrooms</option>
        </select>
      </div>

      {/* Display Properties */}
      <div className="property-list">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} id={property.id} address={property.address} image={property.image} />
          ))
          ) : (
            <p>No properties found.</p>
          )
        }
      </div>
    </div>
  );
};

const PropertyCard = ({ id, address, image }) => (
  <Link to={`/property/${id}`} className="property-card">
    <img src={image} alt="Property" className="property-card-img" />
    <span className="property-card-address">{address}</span>
  </Link>
);

export default Property;
