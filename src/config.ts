/**
 * Central config. The generation backend URL is env-driven (was hardcoded) so
 * it can point at local/staging/prod without code edits.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://fastapi-app-latest-dtka.onrender.com';
