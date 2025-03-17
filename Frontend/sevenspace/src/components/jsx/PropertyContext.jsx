import { createContext, useState, useEffect } from "react";

function createPropertyContext() {
  return createContext();
}

const PropertyContext = createPropertyContext();

const API_BASE_URL = "https://sevenspacerealestate.onrender.com";


function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/property/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return (
    <PropertyContext.Provider value={{ properties, setProperties, loading, error }}>
      {children}
    </PropertyContext.Provider>
  );
}

export { PropertyContext, PropertyProvider };
