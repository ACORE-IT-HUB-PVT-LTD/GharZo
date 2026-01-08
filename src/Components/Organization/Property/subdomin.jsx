export function getSubdomain() {
  const host = window.location.hostname; // e.g., vishhhh.localhost or vishhhh.drazeapp.com
  const parts = host.split(".");

  // Development mode: support localhost with subdomain
  if (host.includes("localhost")) {
    // Example: vishhhh.localhost
    if (parts.length > 1) return parts[0];
    return ""; // default test value
  }

  if (parts.length > 2) {
    return parts[0]; // e.g. vishhhh.drazeapp.com
  }

  return null;
}
