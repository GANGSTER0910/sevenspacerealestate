import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import ExtraImage from "../../assets/Real Estate.jpg";

const API_BASE_URL = "https://sevenspacerealestate.onrender.com"; 
const n = 10;

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
    const categories = ["Flat", "Apartment", "PG", "Hostel", "Cottage"];

    const fetchProperties = async (category) => {
      try {
        const response = await fetch(`${API_BASE_URL}/property/category?category=${category}&status=available`);
        const data = await response.json();
        console.log(data.type);
        setProperties((prev) => ({
          ...prev,
          [category]: data.properties || [], // Ensure data is correctly stored
        }));
      } catch (error) {
        console.error(`Error fetching ${category}:`, error);
      }
    };

    // Fetch data for each category
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
        {Object.entries(properties).map(([category, items]) => (
          <div className="CategorySection" key={category}>
            <span className="Category">{category}</span>
            <div className="scrollable-container">
              <button className="scroll-arrow left" value={category} onClick={(e) => scrolll(e.target.value)}>
                &lt;
              </button>
              <div className="Home_prop_items" id={category}>
                {items.length > 0 ? (
                  items.slice(0,n).map((property) => (
                    <PropertyCard key={property.id} id={property.id} address={property.description} image={property.image || ExtraImage} />
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


