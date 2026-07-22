import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { resolveCampaignDetail } from "@/lib/content/multichannel-content";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function resolveLocale(value: string | null): AppLocale {
  const candidate = value ?? undefined;
  return isAppLocale(candidate) ? candidate : defaultLocale;
}

function escapeXml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clampText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function renderPosterSvg({
  title,
  summary,
  heroImage,
  itemCount,
  featuredItems
}: {
  title: string;
  summary: string;
  heroImage: string;
  itemCount: number;
  featuredItems: string[];
}) {
  const featured = featuredItems.slice(0, 4).join(" / ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="posterShade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#0F0F0F" stop-opacity="0.08"/>
      <stop offset="48%" stop-color="#0F0F0F" stop-opacity="0.66"/>
      <stop offset="100%" stop-color="#0F0F0F" stop-opacity="0.96"/>
    </linearGradient>
    <radialGradient id="goldWash" cx="20%" cy="18%" r="76%">
      <stop offset="0%" stop-color="#C8A96A" stop-opacity="0.34"/>
      <stop offset="58%" stop-color="#C8A96A" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0F0F0F" stop-opacity="0"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#000000" flood-opacity="0.36"/>
    </filter>
  </defs>
  <rect width="1200" height="1600" fill="#0F0F0F"/>
  <image href="${escapeXml(heroImage)}" x="0" y="0" width="1200" height="1600" preserveAspectRatio="xMidYMid slice" opacity="0.72"/>
  <rect width="1200" height="1600" fill="url(#posterShade)"/>
  <rect width="1200" height="1600" fill="url(#goldWash)"/>
  <rect x="72" y="72" width="1056" height="1456" fill="none" stroke="#C8A96A" stroke-opacity="0.28" stroke-width="2"/>
  <text x="92" y="142" fill="#C8A96A" font-family="Georgia, 'Times New Roman', serif" font-size="25" letter-spacing="8">HUAYUN DIGITAL MUSEUM</text>
  <text x="92" y="1048" fill="#F8F6F2" font-family="Georgia, 'Times New Roman', serif" font-size="86" font-weight="400">${escapeXml(clampText(title, 18))}</text>
  <foreignObject x="92" y="1092" width="850" height="210">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#F8F6F2; font-family: Arial, sans-serif; font-size:31px; line-height:1.7; opacity:.76;">${escapeXml(clampText(summary, 116))}</div>
  </foreignObject>
  <g filter="url(#softShadow)">
    <rect x="92" y="1340" width="1016" height="108" rx="18" fill="#0F0F0F" fill-opacity="0.72" stroke="#C8A96A" stroke-opacity="0.2"/>
    <text x="132" y="1405" fill="#C8A96A" font-family="Arial, sans-serif" font-size="26" letter-spacing="5">${itemCount} LINKED HERITAGE</text>
    <text x="742" y="1405" fill="#F8F6F2" font-family="Arial, sans-serif" font-size="25" opacity=".72">${escapeXml(featured)}</text>
  </g>
  <text x="92" y="1498" fill="#F8F6F2" font-family="Arial, sans-serif" font-size="24" opacity=".56">huayun museum - Chinese Intangible Cultural Heritage</text>
</svg>`;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const locale = resolveLocale(new URL(request.url).searchParams.get("locale"));
  const items = await getHeritageItems();
  const detail = resolveCampaignDetail(slug, items, locale);

  if (!detail) {
    return new Response("Campaign not found.", { status: 404 });
  }

  const svg = renderPosterSvg({
    title: detail.displayTitle,
    summary: detail.displaySummary,
    heroImage: detail.heroImage,
    itemCount: detail.itemCount,
    featuredItems: detail.items.map((item) => (locale === "en" ? item.englishName : item.name))
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
