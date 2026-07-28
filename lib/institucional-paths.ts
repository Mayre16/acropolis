import type { QuienesSomosSectionId } from "@/lib/institucional-content";

/** Rutas cortas sin /quienes-somos ni #. */
export const INSTITUCIONAL_SECTION_PATHS: Record<QuienesSomosSectionId, string> =
  {
    "que-es": "/que-es",
    "fundacion-organizacion": "/organizacion",
    principios: "/principios",
    simbolismo: "/simbolismo",
    presidencia: "/presidencia",
    "areas-actuacion": "/areas-actuacion",
    "direccion-nacional": "/direccion",
    "perfil-institucional": "/perfil-institucional",
    anuario: "/anuario",
  };

export const QUIENES_SOMOS_OVERVIEW_PATH = "/quienes-somos";

const PATH_TO_SECTION = Object.fromEntries(
  Object.entries(INSTITUCIONAL_SECTION_PATHS).map(([id, path]) => [
    path.replace(/\/$/, ""),
    id as QuienesSomosSectionId,
  ]),
) as Record<string, QuienesSomosSectionId>;

export function institutionalSectionPath(id: QuienesSomosSectionId): string {
  return INSTITUCIONAL_SECTION_PATHS[id];
}

export function institutionalSectionFromPathname(
  pathname: string,
): QuienesSomosSectionId | null {
  const base = pathname.replace(/\/$/, "") || "/";
  if (base === QUIENES_SOMOS_OVERVIEW_PATH.replace(/\/$/, "")) return "que-es";
  return PATH_TO_SECTION[base] ?? null;
}

/** `/quienes-somos/#que-es` o `#principios` → ruta limpia. */
export function legacyInstitutionalHashPath(
  hash: string,
  pathname: string,
): string | null {
  const id = hash.replace(/^#/, "") as QuienesSomosSectionId;
  if (!(id in INSTITUCIONAL_SECTION_PATHS)) return null;
  const onQuienesSomos = pathname.replace(/\/$/, "").endsWith("/quienes-somos");
  if (!onQuienesSomos && pathname !== "/" && pathname !== "") {
    return null;
  }
  return institutionalSectionPath(id);
}

export const INSTITUCIONAL_STATIC_PATHS = Object.values(
  INSTITUCIONAL_SECTION_PATHS,
);
