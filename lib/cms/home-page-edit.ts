import { NA_INTRO_PARAGRAPHS } from "@/lib/institucional-content";
import type { CmsHomePage, CmsHomePillar } from "@/lib/cms/types";

export const DEFAULT_HOME_PILLARS: CmsHomePillar[] = [
  {
    id: "filosofia",
    title: "Filosofía",
    tagline: "¡Filosofía para despertar!",
    text: "Una escuela de filosofía a la manera clásica: ideas prácticas para conocernos, pensar con criterio y vivir mejor.",
    img: "/img/eventos/santiago.webp",
    imgAlt: "Charla del Diplomado de Filosofía para la Vida",
    href: "/filosofia",
    cta: "Conoce la Escuela",
  },
  {
    id: "cultura",
    title: "Cultura",
    tagline: "¡Cultura para perfeccionar!",
    text: "Talleres de danza, coro y teatro, actividades para jóvenes, eventos y celebraciones que acercan el arte y el conocimiento.",
    img: "/img/cultura/talleres/teatro.webp",
    imgAlt: "Grupo de teatro de Nueva Acrópolis en escena",
    href: "/cultura",
    cta: "Ver actividades",
  },
  {
    id: "voluntariado",
    title: "Voluntariado",
    tagline: "¡Voluntariado para unir!",
    text: "Acción social y ecológica: jornadas de plantación, acompañamiento a hogares de adultos mayores y labores con niños.",
    img: "/img/eventos/feria-salud.webp",
    imgAlt: "Voluntarios de Nueva Acrópolis en una actividad comunitaria",
    href: "/voluntariado",
    cta: "Súmate",
  },
];

export const DEFAULT_HOME_PAGE: CmsHomePage = {
  whatIsNa: {
    imageSrc: "/img/home/grecia.webp",
    imageAlt: "Visitante contemplando el Partenón en la Acrópolis de Atenas",
    paragraphs: [...NA_INTRO_PARAGRAPHS],
    ctaLabel: "Nuestra historia",
  },
  pillars: DEFAULT_HOME_PILLARS,
  philosophyBand: {
    headline: "¡Filosofía para Vivir!",
    eyebrow: "Una propuesta de filosofía diferente",
    text: "La Filosofía para Vivir es práctica y sirve para mejorar la vida.",
    imageSrc: "/img/home/filosofia-para-vivir.webp",
    ctaLabel: "Conozca nuestro programa de estudios",
  },
};

export function mergeHomePage(
  overrides?: CmsHomePage | null,
): CmsHomePage {
  if (!overrides) return DEFAULT_HOME_PAGE;
  const pillarsById = new Map(
    (overrides.pillars ?? []).map((p) => [p.id, p]),
  );
  return {
    whatIsNa: { ...DEFAULT_HOME_PAGE.whatIsNa, ...overrides.whatIsNa },
    pillars: DEFAULT_HOME_PILLARS.map(
      (d) => ({ ...d, ...pillarsById.get(d.id) }),
    ),
    philosophyBand: {
      ...DEFAULT_HOME_PAGE.philosophyBand,
      ...overrides.philosophyBand,
    },
  };
}
