const requestAccessUrl = import.meta.env.VITE_REQUEST_ACCESS_URL?.trim() ?? "";

export const REQUEST_ACCESS_URL = requestAccessUrl;

export function isExternalRequestAccessUrl() {
  return /^https?:\/\//i.test(REQUEST_ACCESS_URL);
}
