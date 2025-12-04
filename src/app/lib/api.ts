// lib/api.ts

const API_SERVERS = {
  main: process.env.NEXT_PUBLIC_API_MAIN,
  library: process.env.NEXT_PUBLIC_API_LIBRARY,
  simpul: process.env.NEXT_PUBLIC_API_SIMPUL,
  admission: process.env.NEXT_PUBLIC_API_ADMISSION,
};

export type ApiServerKey = keyof typeof API_SERVERS;

const api = async (endpoint: string, options: RequestInit = {}, server: ApiServerKey = 'main') => {
  const baseUrl = API_SERVERS[server];

  if (!baseUrl) {
    throw new Error(`API Base URL untuk server "${server}" belum dikonfigurasi.`);
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${baseUrl}/${endpoint}`, {
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
