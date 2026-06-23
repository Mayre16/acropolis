/** Talleres por convocatoria destacados en el carrusel de cursos (home → /contenido). */
export const HOME_TALLERES_FEATURED_IDS = [
  "curso-astrologia-filosofica",
  "curso-oratoria",
  "curso-liderar-conflictos-con-inteligencia",
] as const;

export const HOME_TALLERES_CAROUSEL = {
  eyebrow: "Cursos y Talleres",
  title: "Tu próximo curso empieza aquí:",
  intro:
    "Cursos activos todo el año y talleres por convocatoria — consulta horarios e inscríbete desde cada ficha.",
  linkHref: "/cursos",
  linkLabel: "Ver todos los cursos",
} as const;

export const HOME_SALONES_CAROUSEL = {
  eyebrow: "Espacios institucionales",
  title: "Tienes el taller; nosotros el espacio",
  intro:
    "Salones sobrios y versátiles en Naco, Los Prados y Santiago para tus cursos, charlas y formaciones. Butacas, mesas o herradura según tu actividad.",
  linkHref: "/cursos#salones",
  linkLabel: "Ver salones en cursos",
  ctaLabel: "Renta con nosotros",
} as const;
