import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

const PATHS = [
  "/",
  "/talleres/",
  "/inscribete/",
  "/quienes-somos/",
  "/clientes-aliados/",
  "/nuestro-equipo/",
  "/salones/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.75,
  }));
}
