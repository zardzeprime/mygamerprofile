const DEFAULT_PRODUCTION_SITE_URL = "https://mgprofile.online";

export const PRODUCTION_SITE_URL = (
  import.meta.env["VITE_SITE_URL"] || DEFAULT_PRODUCTION_SITE_URL
).replace(/\/$/, "");

const TRUSTED_TEST_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "mygamerprofile.lovable.app",
]);

export function getAppOrigin() {
  if (typeof window === "undefined") return PRODUCTION_SITE_URL;

  if (TRUSTED_TEST_HOSTS.has(window.location.hostname)) {
    return window.location.origin.replace(/\/$/, "");
  }

  return PRODUCTION_SITE_URL;
}

export function getAuthRedirectUrl(path = "/") {
  const safePath = path.startsWith("/") ? path : "/";
  return `${getAppOrigin()}${safePath}`;
}
