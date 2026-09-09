import type { MetadataRoute } from "next";
import { ARTICULOS } from "@/lib/articulos";
import { EVENTOS } from "@/lib/eventos";
import { SITE_URL } from "@/lib/site-config";
import {
  VIAJE_CATEGORIAS,
  VIAJES_DESTINOS,
  type ViajeCategoriaSlug,
} from "@/lib/viajes";

export const dynamic = "force-static";

const STATIC_PATHS = [
  "/",
  "/filosofia/",
  "/diplomado/",
  "/cultura/",
  "/voluntariado/",
  "/esfera/",
  "/esfera/solicitud/",
  "/cursos/",
  "/donde-estamos/",
  "/quienes-somos/",
  "/relaciones-institucionales/",
  "/articulos/",
  "/eventos/",
  "/contenido/",
  "/legal/privacidad/",
  "/legal/aviso-legal/",
  "/legal/cookies/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const articulo of ARTICULOS) {
    entries.push({
      url: `${SITE_URL}/${articulo.slug}/`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const evento of EVENTOS) {
    entries.push({
      url: `${SITE_URL}/eventos/${evento.slug}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  for (const categoria of Object.keys(VIAJE_CATEGORIAS) as ViajeCategoriaSlug[]) {
    entries.push({
      url: `${SITE_URL}/cultura/viajes/${categoria}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const viaje of VIAJES_DESTINOS) {
    entries.push({
      url: `${SITE_URL}/cultura/viajes/${viaje.categoria}/${viaje.slug}/`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.55,
    });
  }

  return entries;
}
