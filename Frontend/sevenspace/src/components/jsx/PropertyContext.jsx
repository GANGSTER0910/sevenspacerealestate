import { createContext, useState, useEffect } from "react";

const PropertyContext = createContext();

const API_BASE_URL = "https://sevenspacerealestate.onrender.com";

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch(`${API_BASE_URL}/property/all?status=available`);
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    }

    fetchProperties();
  }, []);

  return (
    <PropertyContext.Provider value={{ properties, setProperties }}>
      {children}
    </PropertyContext.Provider>
  );
}

export { PropertyContext };
export default PropertyProvider;
