const url = process.env.url || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  body?: any;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { body, ...fetchOptions } = options;

  const response = await fetch(`${url}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include', 
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

// Add response interceptor for error handling
fetchApi.interceptors = {
  response: {
    use: (successCallback: (response: Response) => Response, errorCallback: (error: any) => Promise<any>) => {
      return async (endpoint: string, options: FetchOptions = {}) => {
        try {
          const response = await fetchApi(endpoint, options);
          return successCallback(response);
        } catch (error) {
          return errorCallback(error);
        }
      };
    },
  },
};

fetchApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);