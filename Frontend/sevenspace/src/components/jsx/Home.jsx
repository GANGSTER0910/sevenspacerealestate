import { Link } from "react-router-dom";
import '../css/Home.css'
import ExtraImage from "../../assets/Real Estate.jpg";

function scrolll(value) {
  let cont = document.querySelector(`#${value}`);
  cont.scrollBy(-350,0);
}

function scrollr(value) {
  let cont = document.querySelector(`#${value}`);
  cont.scrollBy(350,0);
}

export default function Home() {
  return (
    <div id="Home_Main">
      <div id="Home_Heading">
        <div id="Home_Heading_Text">
          <span className='Home_Big_Text'>
            Find your next <span className='Home_Big_Text_Extra'>perfect</span> place with ease
          </span>
          <span className='Home_Small_Text'>
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
        <div className="CategorySection">
          <span className="Category">Flats</span>
          <div className="scrollable-container">
            <button className="scroll-arrow left" value="Flat" onClick={(e) => scrolll(e.target.value)}>&lt;</button>
            <div className="Home_prop_items" id="Flat">
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
            </div>
            <button className="scroll-arrow right" value="Flat" onClick={(e) => scrollr(e.target.value)}>&gt;</button>
          </div>
        </div>

        <div className="CategorySection">
          <span className="Category">Apartments</span>
          <div className="scrollable-container">
            <button className="scroll-arrow left" value="Apartments" onClick={(e) => scrolll(e.target.value)}>&lt;</button>
            <div className="Home_prop_items" id="Apartments">
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
            </div>
            <button className="scroll-arrow right" value="Apartments" onClick={(e) => scrollr(e.target.value)}>&gt;</button>
          </div>
        </div>

        <div className="CategorySection">
          <span className="Category">PG</span>
          <div className="scrollable-container">
            <button className="scroll-arrow left" value="PG" onClick={(e) => scrolll(e.target.value)}>&lt;</button>
            <div className="Home_prop_items" id="PG">
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
            </div>
            <button className="scroll-arrow right" value="PG" onClick={(e) => scrollr(e.target.value)}>&gt;</button>
          </div>
        </div>

        <div className="CategorySection">
          <span className="Category">Hostels</span>
          <div className="scrollable-container">
            <button className="scroll-arrow left" value="Hostels" onClick={(e) => scrolll(e.target.value)}>&lt;</button>
            <div className="Home_prop_items" id="Hostels">
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
            </div>
            <button className="scroll-arrow right" value="Hostels" onClick={(e) => scrollr(e.target.value)}>&gt;</button>
          </div>
        </div>

        <div className="CategorySection">
          <span className="Category">Cottages</span>
          <div className="scrollable-container">
            <button className="scroll-arrow left" value="Cottages" onClick={(e) => scrolll(e.target.value)}>&lt;</button>
            <div className="Home_prop_items" id="Cottages">
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
                <PropertyCard />
            </div>
            <button className="scroll-arrow right" value="Cottages" onClick={(e) => scrollr(e.target.value)}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PropertyCard = () => (
  <div className="Item_Holder">
    <div className="Item_Holder_Img">
      <img src={ExtraImage} className="Item_Img_Edit" alt="Property" />
    </div>
    <div className="Item_Holder_Loc">
      <span className="Item_Loc_Edit">Ahmedabad, Gujarat, India</span>
    </div>
  </div>
);
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import "../css/Home.css";
// import ExtraImage from "../../assets/Real Estate.jpg";

// function scrolll(value) {
//   let cont = document.querySelector(`#${value}`);
//   cont.scrollBy(-350, 0);
// }

// function scrollr(value) {
//   let cont = document.querySelector(`#${value}`);
//   cont.scrollBy(350, 0);
// }

// export default function Home() {
//   const categories = ["Flats", "Apartments", "PG", "Hostels", "Cottages"];
  
//   return (
//     <div id="Home_Main">
//       <div id="Home_Heading">
//         <div id="Home_Heading_Text">
//           <span className="Home_Big_Text">
//             Find your next <span className="Home_Big_Text_Extra">perfect</span> place with ease
//           </span>
//           <span className="Home_Small_Text">
//             Sahand Estate is the best place to find your next perfect place to live. We have a wide range of properties for you to choose from.
//           </span>
//           <span className="Home_Link">
//             <Link to="/Property">Let's get started...</Link>
//           </span>
//         </div>
//         <div id="Home_Heading_Image">
//           <img src={ExtraImage} alt="Real Estate" id="Home_Img" />
//         </div>
//       </div>

//       <div id="Home_properties">
//         {categories.map((category) => (
//           <CategorySection key={category} category={category} />
//         ))}
//       </div>
//     </div>
//   );
// }

// function CategorySection({ category }) {
//   const [properties, setProperties] = useState([]);

//   useEffect(() => {
//     // Fetch properties for the category
//     const fetchProperties = async () => {
//       try {
//         const response = await fetch(`/api/properties?category=${category}`);
//         const data = await response.json();
//         setProperties(data);
//       } catch (error) {
//         console.error("Failed to fetch properties:", error);
//       }
//     };
//     fetchProperties();
//   }, [category]);

//   return (
//     <div className="CategorySection">
//       <span className="Category">{category}</span>
//       <div className="scrollable-container">
//         <button className="scroll-arrow left" onClick={() => scrolll(category)}>&lt;</button>
//         <div className="Home_prop_items" id={category}>
//           {properties.map((property) => (
//             <PropertyCard key={property.id} property={property} />
//           ))}
//         </div>
//         <button className="scroll-arrow right" onClick={() => scrollr(category)}>&gt;</button>
//       </div>
//     </div>
//   );
// }

// const PropertyCard = ({ property }) => (
//   <div className="Item_Holder">
//     <div className="Item_Holder_Img">
//       <img src={property.image || ExtraImage} className="Item_Img_Edit" alt={property.name} />
//     </div>
//     <div className="Item_Holder_Loc">
//       <span className="Item_Loc_Edit">{property.location}</span>
//     </div>
//   </div>
// );
