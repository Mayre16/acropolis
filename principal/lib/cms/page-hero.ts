import { isCmsEnabled } from "@/lib/cms/provider";
import type { CmsHeroCarouselKey, CmsPageHeroText } from "@/lib/cms/types";
import { NA_INTRO_PARAGRAPHS } from "@/lib/institucional-content";

export type PageHeroFallback = {
  eyebrow: string;
  title: string;
  lede?: string;
};

/** Textos por defecto del encabezado cuando aún no hay override en el CMS. */
export const PAGE_HERO_FALLBACKS: Partial<
  Record<CmsHeroCarouselKey, PageHeroFallback>
> = {
  articulos: {
    eyebrow: "Artículos",
    title: "Pensamientos filosóficos",
    lede:
      "Artículos y reflexiones de filosofía práctica para pensar mejor y vivir con sentido. Ideas de Oriente y Occidente al alcance de todos.",
  },
  eventos: {
    eyebrow: "Eventos y Noticias",
    title: "Lo que sucede en Nueva Acrópolis",
    lede:
      "Encuentros, celebraciones, viajes y proyectos de nuestra organización, aquí y en todo el mundo, más allá de nuestras clases y programas regulares.",
  },
  agenda: {
    eyebrow: "Contenido",
    title: "Agenda de actividades",
    lede:
      "Consulta fechas, sedes e inscripciones de todo lo programado en Nueva Acrópolis República Dominicana.",
  },
  cursos: {
    eyebrow: "Cursos y Talleres",
    title: "Aprender, crear y crecer",
    lede:
      "Talleres y cursos abiertos a la comunidad para cultivar el cuerpo, la mente y la creatividad. Cada temporada abrimos nuevas propuestas en nuestras sedes.",
  },
  cultura: {
    eyebrow: "Cultura",
    title: "Arte, encuentro y comunidad",
    lede:
      "Acercamos la filosofía a la vida a través del arte: talleres, eventos y celebraciones en nuestras sedes.",
  },
  voluntariado: {
    eyebrow: "Voluntariado",
    title: "El voluntariado como escuela de valores",
    lede:
      "Servir a los demás y a la naturaleza es parte esencial de la filosofía en acción. Súmate a nuestras actividades y vive el voluntariado activo.",
  },
  esfera: {
    eyebrow: "Punto Focal · Crisis y emergencias",
    title: "Formación que transforma la respuesta humanitaria",
    lede:
      "Talleres y charlas para líderes institucionales sobre los Estándares Humanitarios Esfera, contextualizados a la realidad dominicana.",
  },
  quienesSomos: {
    eyebrow: "Quiénes somos",
    title: "Qué es Nueva Acrópolis",
    lede: NA_INTRO_PARAGRAPHS[0],
  },
  relaciones: {
    eyebrow: "Institucional",
    title: "Relaciones institucionales",
    lede:
      "Nueva Acrópolis construye puentes sólidos de colaboración con otras instituciones para sus proyectos de voluntariado, cultura y acción social, humanitaria y medioambiental.",
  },
  filosofia: {
    eyebrow: "Filosofía",
    title: "Escuela de Filosofía a la manera clásica",
    lede:
      "Un espacio para pensar, conocerse y vivir mejor. La filosofía no como teoría abstracta, sino como una forma práctica de afrontar la vida.",
  },
};

/** Usa el fallback cuando el CMS tiene vacío o solo espacios. */
export function coalesceCmsText(
  value: string | undefined,
  fallback?: string,
): string {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;
  return fallback?.trim() ?? "";
}

export function mergePageHeroFields(
  value: CmsPageHeroText | null | undefined,
  fallback?: PageHeroFallback | null,
) {
  return {
    heroEyebrow: coalesceCmsText(value?.heroEyebrow, fallback?.eyebrow),
    heroTitle: coalesceCmsText(value?.heroTitle, fallback?.title),
    heroLede: coalesceCmsText(value?.heroLede, fallback?.lede),
  };
}

/** Al abrir el editor: rellena el formulario con los textos visibles en el sitio. */
export function loadPageWithHeroDefaults<
  T extends CmsPageHeroText & Record<string, unknown>,
>(
  base: T,
  raw?: Partial<T> | null,
  carouselKey?: CmsHeroCarouselKey,
  fallback?: PageHeroFallback | null,
): T {
  const resolvedFallback =
    fallback ??
    (carouselKey ? PAGE_HERO_FALLBACKS[carouselKey] : undefined);
  return {
    ...base,
    ...raw,
    ...mergePageHeroFields(raw, resolvedFallback),
  } as T;
}

export function resolvePageHero(
  fallback: PageHeroFallback,
  cms?: CmsPageHeroText | null,
  edit?: CmsPageHeroText | null,
  editReady?: boolean,
): PageHeroFallback {
  if (editReady && edit) {
    return {
      eyebrow: coalesceCmsText(edit.heroEyebrow, fallback.eyebrow),
      title: coalesceCmsText(edit.heroTitle, fallback.title),
      lede: coalesceCmsText(edit.heroLede, fallback.lede),
    };
  }
  if (isCmsEnabled() && cms) {
    return {
      eyebrow: coalesceCmsText(cms.heroEyebrow, fallback.eyebrow),
      title: coalesceCmsText(cms.heroTitle, fallback.title),
      lede: coalesceCmsText(cms.heroLede, fallback.lede),
    };
  }
  return fallback;
}
