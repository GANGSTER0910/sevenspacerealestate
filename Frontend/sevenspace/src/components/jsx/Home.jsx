import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import ExtraImage from "../../assets/Real Estate.jpg";

const API_BASE_URL = "https://sevenspacerealestate.onrender.com"; 
const n = 10;
const categories = ["Flat", "Apartment", "PG", "Hostel", "Cottage"];

function scrolll(value) {
  let cont = document.querySelector(`#${value}`);
  cont.scrollBy(-350, 0);
}

function scrollr(value) {
  let cont = document.querySelector(`#${value}`);
  cont.scrollBy(350, 0);
}

export default function Home() {
  const [properties, setProperties] = useState({
    Flat: [],
    Apartment: [],
    PG: [],
    Hostel: [],
    Cottage: [],
  });

  useEffect(() => {
    const fetchProperties = async (category) => {
      try {
        // const response = await fetch(`${API_BASE_URL}/property/category?category=${category}&status=available`);
        const response = await fetch(`${API_BASE_URL}/property/all`);
        const data = await response.json();
        console.log(data.properties[0]);
        setProperties((prev) => ({
          ...prev,
          [category]: data.properties || [],
        }));
      } catch (error) {
        console.error(`Error fetching ${category}:`, error);
      }
    };

    categories.forEach((category) => fetchProperties(category));
  }, []);

  return (
    <div id="Home_Main">
      <div id="Home_Heading">
        <div id="Home_Heading_Text">
          <span className="Home_Big_Text">
            Find your next <span className="Home_Big_Text_Extra">perfect</span> place with ease
          </span>
          <span className="Home_Small_Text">
            Sahand Estate is the best place to find your next perfect place to live. We have a wide range of properties for you to choose from.
          </span>
          <span className="Home_Link">
            <Link to="/Property">Let's get started...</Link>
          </span>
        </div>
        <div id="Home_Heading_Image">
          <img src={ExtraImage} alt="Real Estate" id="Home_Img" />
        </div>
      </div>

      <div id="Home_properties">
        {categories.map((category) => (
          <div className="CategorySection" key={category}>
            <span className="Category">{category}</span>
            <div className="scrollable-container">
              <button className="scroll-arrow left" value={category} onClick={(e) => scrolll(e.target.value)}>
                &lt;
              </button>
              <div className="Home_prop_items" id={category}>
                {properties[category]?.length > 0 ? (
                  properties[category].slice(0, n).map((property) => (
                    <PropertyCard 
                      id={property.id} 
                      address={property.title} 
                      image={property.image || ExtraImage} 
                    />
                  ))
                ) : (
                  <p>No properties available</p>
                )}
              </div>
              <button className="scroll-arrow right" value={category} onClick={(e) => scrollr(e.target.value)}>
                &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PropertyCard = ({ id, address, image }) => (
  <Link to={`/property/${id}`} className="property-card">
    <img src={image} alt="Property" className="property-card-img" />
    <span className="property-card-address">{address || "Address not available"}</span>
  </Link>
);
