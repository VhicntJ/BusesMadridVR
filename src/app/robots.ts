import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://busesmadrid.cl/sitemap.xml",
    host: "https://busesmadrid.cl",
  };
}
