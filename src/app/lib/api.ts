// lib/api.ts

// Fungsi ini akan menjadi pengganti `fetch` Anda
const api = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

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
