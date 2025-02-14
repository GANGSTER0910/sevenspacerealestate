// // import React, { useState, useEffect } from "react";


// // const Property = () => {
// //   const [filters, setFilters] = useState({
// //     type: "All",
// //     priceRange: "All",
// //     bedrooms: "All",
// //     bathrooms: "All",
// //   });
// //   const [filteredProperties, setFilteredProperties] = useState([]);

// //   useEffect(() => {
// //     const filtered = mockData.filter((prop) => {
// //       return (
// //         (filters.type === "All" || prop.type === filters.type) &&
// //         (filters.priceRange === "All" || checkPriceRange(prop.price, filters.priceRange)) &&
// //         (filters.bedrooms === "All" || prop.bedrooms.toString() === filters.bedrooms) &&
// //         (filters.bathrooms === "All" || prop.bathrooms.toString() === filters.bathrooms)
// //       );
// //     });
// //     setFilteredProperties(filtered);
// //   }, [filters]);

// //   const checkPriceRange = (price, range) => {
// //     const ranges = {
// //       "Under 3L": price < 300000,
// //       "3L-6L": price >= 300000 && price <= 600000,
// //       "Above 6L": price > 600000,
// //     };
// //     return ranges[range];
// //   };

// //   const handleFilterChange = (e) => {
// //     setFilters({ ...filters, [e.target.name]: e.target.value });
// //   };

// //   return (
// //     <div id="property_page_div">
// //       <div id="property-container">
// //         <h1 id="property-title">Find Your Dream Property</h1>

// //         <div id="property-filters">
// //           <select name="type" className="property-filter-dropdown" onChange={handleFilterChange}>
// //             <option value="All">All Types</option>
// //             <option value="Flat">Flat</option>
// //             <option value="Apartment">Apartment</option>
// //             <option value="PG">PG</option>
// //             <option value="Hostel">Hostel</option>
// //           </select>

// //           <select name="priceRange" className="property-filter-dropdown" onChange={handleFilterChange}>
// //             <option value="All">All Prices</option>
// //             <option value="Under 3L">Under 3L</option>
// //             <option value="3L-6L">3L - 6L</option>
// //             <option value="Above 6L">Above 6L</option>
// //           </select>

// //           <select name="bedrooms" className="property-filter-dropdown" onChange={handleFilterChange}>
// //             <option value="All">All Bedrooms</option>
// //             <option value="1">1</option>
// //             <option value="2">2</option>
// //             <option value="3">3</option>
// //             <option value="4">4</option>
// //           </select>

// //           <select name="bathrooms" className="property-filter-dropdown" onChange={handleFilterChange}>
// //             <option value="All">All Bathrooms</option>
// //             <option value="1">1</option>
// //             <option value="2">2</option>
// //             <option value="3">3</option>
// //           </select>
// //         </div>

// //         <div id="property-list">
// //           {filteredProperties.length > 0 ? (
// //             filteredProperties.map((property) => (
// //               <PropertyCard key={property.id} id={property.id} address={property.address} image={property.image} />
// //             ))
// //           ) : (
// //             <p id="no-properties-msg">No properties match your criteria.</p>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const PropertyCard = ({ id, address, image }) => (
// //   <Link to={`/property/${id}`} className="property-card">
// //     <img src={image} alt="Property" className="property-card-img" />
// //     <span className="property-card-address">{address}</span>
// //   </Link>
// // );

// // export default Property;
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import ExtraImage from "../../assets/Real Estate.jpg";
// import "../css/Property.css"; 
// const Property = () => {
//   const [properties, setProperties] = useState([]);
//   const [filter, setFilter] = useState({ type: "All", priceRange: "All", bedrooms: "All", bathrooms: "All" });
//   const [filteredProperties, setFilteredProperties] = useState([]);
//   const categories = ["Flat", "Apartment", "PG", "Hostel", "Cottage"];

//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         const allProperties = [];

//         for (const category of categories) {
//           const response = await fetch(`http://localhost:8000/property/category=${category}?status=available`); // Corrected URL template
//           const data = await response.json();
//           allProperties.push(...data);
//         }

//         setProperties(allProperties);
//       } catch (error) {
//         console.error("Error fetching properties:", error);
//       }
//     };

//     fetchProperties();
//   }, []);

//   useEffect(() => {
//     const filtered = properties.filter((prop) => {
//       return (
//         (filter.property_type === "All" || prop.property_type === filter.type) &&
//         (filter.priceRange === "All" || checkPriceRange(prop.price, filter.priceRange)) &&
//         (filter.bedrooms === "All" || prop.bedrooms.toString() === filter.bedrooms) &&
//         (filter.bathrooms === "All" || prop.bathrooms.toString() === filter.bathrooms)
//       );
//     });

//     setFilteredProperties(filtered);
//   }, [filter, properties]);

//   const handleFilterChange = (event) => {
//     const { name, value } = event.target;
//     setFilter((prevFilters) => ({ ...prevFilters, [name]: value }));
//   };

//   const checkPriceRange = (price, range) => {
//     switch (range) {
//       case "Low":
//         return price < 50000;
//       case "Medium":
//         return price >= 50000 && price <= 150000;
//       case "High":
//         return price > 150000;
//       default:
//         return true;
//     }
//   };

//   return (
//     <div>
//       <h1>Property</h1>
//       <div className="filters">
//         <select name="type" onChange={handleFilterChange}>
//           <option value="All">All Types</option>
//           <option value="Apartment">Apartment</option>
//           <option value="House">House</option>
//           <option value="Villa">Villa</option>
//         </select>

//         <select name="priceRange" onChange={handleFilterChange}>
//           <option value="All">All Prices</option>
//           <option value="Low">Below $50,000</option>
//           <option value="Medium">$50,000 - $150,000</option>
//           <option value="High">Above $150,000</option>
//         </select>

//         <select name="bedrooms" onChange={handleFilterChange}>
//           <option value="All">All Bedrooms</option>
//           <option value="1">1</option>
//           <option value="2">2</option>
//           <option value="3">3</option>
//           <option value="4">4+</option>
//         </select>

//         <select name="bathrooms" onChange={handleFilterChange}>
//           <option value="All">All Bathrooms</option>
//           <option value="1">1</option>
//           <option value="2">2</option>
//           <option value="3">3</option>
//           <option value="4">4+</option>
//         </select>
//       </div>

//       <div className="property-list">
//         {filteredProperties.length > 0 ? (
//           filteredProperties.map((property) => (
//             <div key={property.id} className="property-card">
//               <h3>{property.name}</h3>
//               <p>Type: {property.type}</p>
//               <p>Price: ${property.price}</p>
//               <p>Bedrooms: {property.bedrooms}</p>
//               <p>Bathrooms: {property.bathrooms}</p>
//             </div>
//           ))
//         ) : (
//           <p>No properties found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Property;
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
  const [properties, setProperties] = useState([]); 
  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    const categories = ["Flat", "Apartment", "PG", "Hostel", "Cottage"];
    const fetchProperties = async (category) => {
      try {
        const response = await fetch("https://sevenspacerealestate.onrender.com/property/category?category=${category}&status=available"); // Replace with actual FastAPI endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await response.json();
        // print(data.type);
        console.log(data);
        setProperties((prev) => ({
          ...prev,
          [category]: data.properties || [],
        }));
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    categories.forEach((category) => fetchProperties(category));
  }, []);

  useEffect(() => {
    if (properties.length === 0) return;

    const filtered = properties.filter((prop) => {
      return (
        (filters.type === "All" || prop.type === filters.type) &&
        (filters.priceRange === "All" || checkPriceRange(prop.price, filters.priceRange)) &&
        (filters.bedrooms === "All" || prop.bedrooms.toString() === filters.bedrooms) &&
        (filters.bathrooms === "All" || prop.bathrooms.toString() === filters.bathrooms)
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
            <option value="4">4+</option>
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
