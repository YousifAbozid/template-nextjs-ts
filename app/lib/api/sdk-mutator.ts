import type { AxiosRequestConfig } from 'axios';

/**
 * Custom Axios instance for Orval-generated SDK
 */
export const customInstance = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  // Use native fetch for Next.js compatibility
  const { url, method = 'GET', data, headers, params } = config;

  // Build URL with query params
  const queryString = params
    ? '?' +
      Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join('&')
    : '';

  const fullUrl = `${url}${queryString}`;

  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>)
    } as HeadersInit,
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    const error = new Error(
      `HTTP ${response.status}: ${response.statusText}`
    ) as Error & { response?: { status: number; data: unknown } };
    error.response = {
      status: response.status,
      data: await response.json().catch(() => ({}))
    };
    throw error;
  }

  return response.json();
};

export default customInstance;
