import { url } from "inspector";

const url1 = import.meta.env.VITE_url || 'http://localhost:8000';
interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options;
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Build URL with query parameters
  let url = `${url1}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // This is important for cookies
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Parse JSON response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export default fetchApi; 