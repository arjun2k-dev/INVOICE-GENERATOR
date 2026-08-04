const BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Centralized HTTP client wrapper using native window.fetch
 *
 * @param {string} endpoint - API path relative to BASE_URL (e.g., '/invoices')
 * @param {object} options - Request options (method, headers, body, etc.)
 * @returns {Promise<any>} Parsed JSON or text response
 */
export async function fetchClient(endpoint, options = {}) {
  const token = localStorage.getItem('jwtToken');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Inject Authorization Bearer token if present in LocalStorage
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  // Automatically stringify body objects if not raw strings or FormData
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Check HTTP status code (200-299)
  if (!response.ok) {
    const errorMessage =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' && data) ||
      `HTTP Error ${response.status}: ${response.statusText}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}