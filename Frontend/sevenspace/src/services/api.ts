const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000' || 'https://sevenspacerealestate.onrender.com';

interface FetchOptions extends RequestInit {
  body?: any;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { body, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}; 