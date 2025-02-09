import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExtraImage from "../../assets/Real Estate.jpg";
import "../css/Property.css"; 

const Property = () => {
  const [filters, setFilters] = useState({
    type: "All",
    priceRange: "All",
    bedrooms: "All",
    bathrooms: "All",
  });
  const [filteredProperties, setFilteredProperties] = useState([]);

  const mockData = [
    // Flats (15)
    { id: 1, type: "Flat", address: "123 Main St, Mumbai", price: 500000, area_sqft: 1200, bedrooms: 3, bathrooms: 2, image: ExtraImage },
    { id: 2, type: "Flat", address: "456 Park Ave, Delhi", price: 600000, area_sqft: 1400, bedrooms: 4, bathrooms: 3, image: ExtraImage },
    { id: 3, type: "Flat", address: "789 Ocean Drive, Chennai", price: 550000, area_sqft: 1300, bedrooms: 3, bathrooms: 2, image: ExtraImage },
    { id: 4, type: "Flat", address: "101 Residency Rd, Bangalore", price: 750000, area_sqft: 1600, bedrooms: 4, bathrooms: 3, image: ExtraImage },
    { id: 5, type: "Flat", address: "22 University Lane, Pune", price: 680000, area_sqft: 1500, bedrooms: 3, bathrooms: 2, image: ExtraImage },
    { id: 6, type: "Flat", address: "55 Mountain View, Manali", price: 720000, area_sqft: 1400, bedrooms: 2, bathrooms: 2, image: ExtraImage },
    { id: 7, type: "Flat", address: "678 Sunrise Blvd, Kolkata", price: 480000, area_sqft: 1250, bedrooms: 3, bathrooms: 2, image: ExtraImage },
    { id: 8, type: "Flat", address: "890 Sunset Road, Hyderabad", price: 630000, area_sqft: 1350, bedrooms: 2, bathrooms: 2, image: ExtraImage },
    { id: 9, type: "Flat", address: "303 Metro Tower, Ahmedabad", price: 700000, area_sqft: 1550, bedrooms: 4, bathrooms: 3, image: ExtraImage },
    { id: 10, type: "Flat", address: "45 College St, Jaipur", price: 580000, area_sqft: 1300, bedrooms: 3, bathrooms: 2, image: ExtraImage },
    { id: 11, type: "Flat", address: "99 Lakeside, Udaipur", price: 690000, area_sqft: 1450, bedrooms: 4, bathrooms: 3, image: ExtraImage },
    { id: 12, type: "Flat", address: "12 Greenway, Chandigarh", price: 510000, area_sqft: 1200, bedrooms: 2, bathrooms: 2, image: ExtraImage },
    { id: 13, type: "Flat", address: "234 Elite Road, Nagpur", price: 590000, area_sqft: 1300, bedrooms: 3, bathrooms: 2, image: ExtraImage },
    { id: 14, type: "Flat", address: "678 Sapphire Lane, Surat", price: 600000, area_sqft: 1400, bedrooms: 3, bathrooms: 3, image: ExtraImage },
    { id: 15, type: "Flat", address: "890 Pearl Tower, Indore", price: 530000, area_sqft: 1250, bedrooms: 2, bathrooms: 2, image: ExtraImage },
  
    // Apartments (15)
    { id: 16, type: "Apartment", address: "111 Riverwalk, Goa", price: 800000, area_sqft: 2000, bedrooms: 5, bathrooms: 4, image: ExtraImage },
    { id: 17, type: "Apartment", address: "222 Skyline, Hyderabad", price: 750000, area_sqft: 1800, bedrooms: 4, bathrooms: 3, image: ExtraImage },
    { id: 18, type: "Apartment", address: "333 Grand Tower, Pune", price: 780000, area_sqft: 1950, bedrooms: 5, bathrooms: 4, image: ExtraImage },
    { id: 19, type: "Apartment", address: "444 Elite Residency, Chennai", price: 850000, area_sqft: 2100, bedrooms: 5, bathrooms: 4, image: ExtraImage },
    { id: 20, type: "Apartment", address: "555 Royal Square, Mumbai", price: 900000, area_sqft: 2200, bedrooms: 6, bathrooms: 5, image: ExtraImage },
    { id: 21, type: "Apartment", address: "666 Lux Heights, Delhi", price: 820000, area_sqft: 2050, bedrooms: 5, bathrooms: 4, image: ExtraImage },
    { id: 22, type: "Apartment", address: "777 Ocean View, Goa", price: 950000, area_sqft: 2300, bedrooms: 6, bathrooms: 5, image: ExtraImage },
    { id: 23, type: "Apartment", address: "888 Sunrise Tower, Bangalore", price: 870000, area_sqft: 2150, bedrooms: 5, bathrooms: 4, image: ExtraImage },
    { id: 24, type: "Apartment", address: "999 Luxury Park, Jaipur", price: 920000, area_sqft: 2250, bedrooms: 6, bathrooms: 5, image: ExtraImage },
    // Add 6 more Apartments...
  
    // PGs (15)
    { id: 31, type: "PG", address: "222 Metro Square, Mumbai", price: 200000, area_sqft: 300, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    { id: 32, type: "PG", address: "333 Comfort Homes, Delhi", price: 230000, area_sqft: 350, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    { id: 33, type: "PG", address: "444 StayInn, Bangalore", price: 190000, area_sqft: 280, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    { id: 34, type: "PG", address: "555 HomeStay, Chennai", price: 250000, area_sqft: 320, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    // Add 11 more PGs...
  
    // Hostels (15)
    { id: 46, type: "Hostel", address: "666 Student Zone, Bangalore", price: 180000, area_sqft: 250, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    { id: 47, type: "Hostel", address: "777 College Residency, Pune", price: 210000, area_sqft: 300, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    { id: 48, type: "Hostel", address: "888 University Block, Delhi", price: 200000, area_sqft: 280, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    { id: 49, type: "Hostel", address: "999 Youth Hostel, Chennai", price: 190000, area_sqft: 260, bedrooms: 1, bathrooms: 1, image: ExtraImage },
    // Add 11 more Hostels...
  ];

  useEffect(() => {
    const filtered = mockData.filter((prop) => {
      return (
        (filters.type === "All" || prop.type === filters.type) &&
        (filters.priceRange === "All" || checkPriceRange(prop.price, filters.priceRange)) &&
        (filters.bedrooms === "All" || prop.bedrooms.toString() === filters.bedrooms) &&
        (filters.bathrooms === "All" || prop.bathrooms.toString() === filters.bathrooms)
      );
    });
    setFilteredProperties(filtered);
  }, [filters]);

  const checkPriceRange = (price, range) => {
    const ranges = {
      "Under 3L": price < 300000,
      "3L-6L": price >= 300000 && price <= 600000,
      "Above 6L": price > 600000,
    };
    return ranges[range];
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div id="property_page_div">
      <div id="property-container">
        <h1 id="property-title">Find Your Dream Property</h1>

        <div id="property-filters">
          <select name="type" className="property-filter-dropdown" onChange={handleFilterChange}>
            <option value="All">All Types</option>
            <option value="Flat">Flat</option>
            <option value="Apartment">Apartment</option>
            <option value="PG">PG</option>
            <option value="Hostel">Hostel</option>
          </select>

          <select name="priceRange" className="property-filter-dropdown" onChange={handleFilterChange}>
            <option value="All">All Prices</option>
            <option value="Under 3L">Under 3L</option>
            <option value="3L-6L">3L - 6L</option>
            <option value="Above 6L">Above 6L</option>
          </select>

          <select name="bedrooms" className="property-filter-dropdown" onChange={handleFilterChange}>
            <option value="All">All Bedrooms</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>

          <select name="bathrooms" className="property-filter-dropdown" onChange={handleFilterChange}>
            <option value="All">All Bathrooms</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        <div id="property-list">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard key={property.id} id={property.id} address={property.address} image={property.image} />
            ))
          ) : (
            <p id="no-properties-msg">No properties match your criteria.</p>
          )}
        </div>
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
