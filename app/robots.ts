import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      },
      {
        userAgent: "*",
        disallow: ["/admin", "/zh/admin", "/en/admin", "/api/", "/monitoring"]
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
