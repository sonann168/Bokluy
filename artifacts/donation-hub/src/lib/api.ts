/**
 * Returns the base URL for API calls.
 * Uses the Vite BASE_URL + /api path prefix.
 */
export function getApiUrl(): string {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';
  return `${base}/api`;
}
