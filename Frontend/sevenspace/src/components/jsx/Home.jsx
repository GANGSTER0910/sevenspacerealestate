import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import ExtraImage from "../../assets/Real Estate.jpg";

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
    Flats: [],
    Apartments: [],
    PG: [],
    Hostels: [],
    Cottages: [],
  });

  useEffect(() => {
    // Mock data with unique IDs
    const mockData = [
      { id: 1, type: "Flat", address: "123 Main St, Mumbai, India", image: ExtraImage },
      { id: 2, type: "Flat", address: "456 Park Ave, Delhi, India", image: ExtraImage },
      { id: 3, type: "Apartment", address: "789 Ocean Drive, Chennai, India", image: ExtraImage },
      { id: 4, type: "PG", address: "101 Residency Rd, Bangalore, India", image: ExtraImage },
      { id: 5, type: "Hostel", address: "22 University Lane, Pune, India", image: ExtraImage },
      { id: 6, type: "Cottage", address: "55 Mountain View, Manali, India", image: ExtraImage },
      { id: 7, type: "Flat", address: "678 Sunrise Blvd, Kolkata, India", image: ExtraImage },
      { id: 8, type: "Apartment", address: "890 Sunset Road, Hyderabad, India", image: ExtraImage },
      { id: 9, type: "PG", address: "303 Metro Tower, Ahmedabad, India", image: ExtraImage },
      { id: 10, type: "Hostel", address: "45 College St, Jaipur, India", image: ExtraImage },
      { id: 11, type: "Cottage", address: "99 Lakeside, Udaipur, India", image: ExtraImage },
    ];
  
    // Categorizing properties
    const categorizedProperties = {
      Flats: mockData.filter((p) => p.type === "Flat"),
      Apartments: mockData.filter((p) => p.type === "Apartment"),
      PG: mockData.filter((p) => p.type === "PG"),
      Hostels: mockData.filter((p) => p.type === "Hostel"),
      Cottages: mockData.filter((p) => p.type === "Cottage"),
    };
  
    setProperties(categorizedProperties);
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
                  items.map((property, index) => (
                    <PropertyCard key={property.id} id={property.id} address={property.address} image={property.image} />
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
  <Link to={`/property/${id}`} className="Item_Holder">
    <div className="Item_Holder_Img">
      <img src={image} className="Item_Img_Edit" alt="Property" />
    </div>
    <div className="Item_Holder_Loc">
      <span className="Item_Loc_Edit">{address || "Address not available"}</span>
    </div>
  </Link>
);