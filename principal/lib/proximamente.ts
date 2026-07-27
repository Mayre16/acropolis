import type { PlatformId } from "@/lib/site-config";
import { PLATFORM_PRODUCTION_URLS, PLATAFORMAS } from "@/lib/site-config";

export type ProximamenteSiteId = PlatformId;

export type ProximamenteSite = {
  id: ProximamenteSiteId;
  label: string;
  domain: string;
  blurb: string;
};

const BLURBS: Record<ProximamenteSiteId, string> = {
  civis:
    "Consultoría y formación ciudadana de Civis Consulting. El sitio público se publica en este dominio.",
  tienda:
    "Librería Editorial Logos — catálogo de libros y pedidos en línea.",
  biblioteca:
    "Biblioteca Sophia — consulta y préstamo del acervo de Nueva Acrópolis.",
  circulo:
    "Círculo de Amigos OINADOM — espacio abierto para participar en actividades.",
};

export const PROXIMAMENTE_SITES: ProximamenteSite[] = PLATAFORMAS.map((p) => ({
  id: p.id,
  label: p.label,
  domain: PLATFORM_PRODUCTION_URLS[p.id].replace(/^https?:\/\//, ""),
  blurb: BLURBS[p.id],
}));

export function getProximamenteSite(
  id: string,
): ProximamenteSite | undefined {
  return PROXIMAMENTE_SITES.find((s) => s.id === id);
}

export const PROXIMAMENTE_SITE_IDS = PROXIMAMENTE_SITES.map((s) => s.id);
