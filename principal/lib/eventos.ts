// Eventos y actividades de Nueva Acrópolis RD (contenido real de acropolis.org.do).
// Cada evento abre su propia página en /eventos/<slug>.

import type { AgendaCategory } from "@/lib/agenda";

export type EventoItem = {
  slug: string;
  title: string;
  date: string;
  /** ISO YYYY-MM-DD para ordenar crónicas. */
  sortAt?: string;
  /** Etiqueta visible en tarjetas. */
  category: string;
  /** Id de categoría para filtros y SEO. */
  categoryId?: AgendaCategory;
  seoTags?: string[];
  excerpt: string;
  image: { src: string; alt: string };
  body: string[];
};

export const EVENTOS: EventoItem[] = [
  {
    slug: "el-arte-de-respirar",
    title: 'Encuentro "El arte de respirar"',
    date: "6 de mayo de 2026",
    sortAt: "2026-05-06",
    category: "Cultura",
    excerpt:
      "Una jornada para redescubrir la respiración consciente como herramienta de calma, atención y bienestar interior.",
    image: {
      src: "/img/eventos/respirar.webp",
      alt: "Encuentro de respiración consciente en Nueva Acrópolis",
    },
    body: [
      "Nueva Acrópolis Dominicana realizó el encuentro “El arte de respirar: ciencia, respiración y equilibrio interior”, celebrado en Izbira Event Venue como parte de la programación de su Punto Cultural.",
      "La actividad reunió a 18 participantes en una experiencia de bienestar consciente orientada a hacer una pausa del ritmo cotidiano, reconectar con el cuerpo y explorar el poder de la respiración consciente y el descanso profundo.",
      "La jornada inició a las 6:30 de la tarde con ejercicios de respiración guiada y continuó con movimientos suaves y restaurativos enfocados en liberar tensiones y promover calma y equilibrio interior en un ambiente sereno y contemplativo.",
      "Con iniciativas como esta, Nueva Acrópolis Dominicana continúa promoviendo espacios culturales y formativos que integran ciencia, filosofía y bienestar, fomentando una vida más consciente y armónica.",
    ],
  },
  {
    slug: "dia-de-la-tierra",
    title: "Día de la Tierra con ciencia, filosofía y acción",
    date: "22 de abril de 2026",
    sortAt: "2026-04-22",
    category: "Voluntariado",
    excerpt:
      "Celebramos el Día de la Tierra uniendo reflexión filosófica y acción concreta por el medio ambiente.",
    image: {
      src: "/img/eventos/tierra.webp",
      alt: "Voluntarios en jornada de reforestación — Día de la Tierra",
    },
    body: [
      "En el marco del Día Internacional de la Madre Tierra, Nueva Acrópolis Dominicana llevó a cabo una trilogía de encuentros sobre la naturaleza —abejas, bosques y cosmos— y cerró con una jornada de reforestación en La Jagua, Yaguate (San Cristóbal).",
      "Cincuenta y tres voluntarios sembraron 1.080 plántulas de caoba dominicana y guázara, uniendo reflexión filosófica y acción ecológica en favor de nuestro entorno.",
      "La programación integró charlas abiertas y trabajo de campo, reafirmando el compromiso de la escuela con el servicio a la comunidad y el cuidado del planeta.",
    ],
  },
  {
    slug: "valor-de-las-abejas",
    title:
      "Charla sobre el valor de las abejas y apertura del nuevo Centro Cultural",
    date: "20 de abril de 2026",
    sortAt: "2026-04-20",
    category: "Cultura",
    excerpt:
      "Una charla sobre el papel esencial de las abejas en la naturaleza, junto al anuncio de nuestro nuevo Centro Cultural.",
    image: {
      src: "/img/eventos/abejas.webp",
      alt: "Charla sobre el valor de las abejas y apertura del nuevo Centro Cultural",
    },
    body: [
      "En el marco de la celebración del Día de la Tierra, Nueva Acrópolis Dominicana llevó a cabo la charla “El secreto de las abejas: la vida pequeña que sostiene todo”, realizada en Izbira, marcando además el inicio de la apertura de un nuevo centro cultural en la ciudad de Santo Domingo.",
      "La exposición inició con Mónica Ponce de León y Alejandra Flórez, de Miel Nucayní, quienes ofrecieron un recorrido didáctico por la vida de las abejas: su rol esencial como polinizadores, los sistemas de comunicación entre abejas y flores, la estructura del panal y el alto grado de cooperación que caracteriza a estas comunidades.",
      "A continuación, Sally Polanco Bloise desarrolló una exposición sobre el simbolismo de las abejas en diversas culturas: desde el antiguo Egipto, donde representaban el orden cósmico, hasta la Grecia clásica, donde las “melisas” eran consideradas sacerdotisas guardianas de los misterios sagrados.",
      "La jornada concluyó con una degustación de miel, propiciando un espacio de encuentro y reforzando el mensaje central de la actividad: valorar, proteger y aprender de estas pequeñas pero esenciales guardianas de la vida.",
    ],
  },
  {
    slug: "feria-de-la-salud",
    title: "Participación en la Feria de la Salud Ferries del Caribe",
    date: "10 de marzo de 2026",
    sortAt: "2026-03-10",
    category: "Comunidad",
    excerpt:
      "Estuvimos presentes en la 13ª Feria de la Salud, acercando filosofía práctica y bienestar a la comunidad.",
    image: {
      src: "/img/eventos/feria-salud.webp",
      alt: "Voluntarios de Nueva Acrópolis en la Feria de la Salud",
    },
    body: [
      "Nueva Acrópolis Dominicana participó en la 13ª Feria de la Salud organizada por la Fundación Ferries del Caribe, con un stand de voluntarios que acercó a la comunidad ideas de filosofía práctica, bienestar y servicio.",
      "Durante la jornada compartimos materiales sobre nuestros programas de voluntariado, actividades abiertas y la Escuela de Filosofía, en un espacio de encuentro orientado al cuidado integral de las personas.",
      "La presencia en ferias comunitarias forma parte de nuestro compromiso de llevar la cultura y el voluntariado a espacios públicos, dialogando con quienes buscan mejorar su calidad de vida.",
    ],
  },
];

export function getEvento(slug: string): EventoItem | undefined {
  return EVENTOS.find((e) => e.slug === slug);
}
