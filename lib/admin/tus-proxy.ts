export function buildProxiedTusLocation(location: string, upstreamBase: string) {
  const upstreamUrl = new URL(location, upstreamBase);
  const upstreamBaseUrl = new URL(upstreamBase);
  const suffix = upstreamUrl.pathname
    .replace(upstreamBaseUrl.pathname, "")
    .replace(/^\/+/, "");

  return `/api/admin/media/tus${suffix ? `/${suffix}` : ""}`;
}
