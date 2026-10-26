import { MetadataRoute } from "next";
import { getBusinesses } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://feira-digital-xi.vercel.app";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const businesses = await getBusinesses();
    const dynamicEntries: MetadataRoute.Sitemap = businesses.map(b => ({
      url: `${baseUrl}/${b.slug}`,
      lastModified: b.created_at ? new Date(b.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...dynamicEntries];
  } catch (error) {
    console.error("Erro ao gerar sitemap dinâmico:", error);
    return staticEntries;
  }
}
