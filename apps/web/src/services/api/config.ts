const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredApiBaseUrl || "/api").replace(/\/+$/, "");

export const API_ORIGIN = ABSOLUTE_URL_PATTERN.test(API_BASE_URL)
  ? new URL(API_BASE_URL).origin
  : undefined;

export function resolveApiUrl(path: string) {
  if (!path) return path;
  if (ABSOLUTE_URL_PATTERN.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_ORIGIN ? `${API_ORIGIN}${normalizedPath}` : normalizedPath;
}
