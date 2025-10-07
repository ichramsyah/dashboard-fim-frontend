// lib/api.ts
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  console.log('API Response:', response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  if (response.headers.get('Content-Type')?.includes('application/json')) {
    return response.json();
  }

  return response;
};

export default api;
