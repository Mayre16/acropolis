// Apariciones de nuestros directores y miembros en medios externos:

// entrevistas, artículos, charlas y programas. Enlazan al medio original.



export type MedioKind =

  | "Entrevista"

  | "Artículo"

  | "Charla"

  | "Programa"

  | "Video";



export type MedioItem = {

  id: string;

  title: string;

  outlet: string;

  kind: MedioKind;

  people: string;

  date?: string;

  excerpt: string;

  /** Enlace al medio original (abre fuera del sitio). */

  url?: string;

  image?: { src: string; alt: string };

};



export const MEDIOS: MedioItem[] = [

  {

    id: "filosofia-etica-era-digital",

    title: "Filosofía y ética en la era digital",

    outlet: "Diario Libre",

    kind: "Entrevista",

    people: "Gabriel Paredes",

    date: "14 nov 2025",

    excerpt:

      "Junto al catedrático Juan Manuel de Faramiñán, nuestro director nacional reflexiona sobre la responsabilidad moral del ser humano frente a la inteligencia artificial y la dignidad humana.",

    url: "https://www.diariolibre.com/revista/buena-vida/2025/11/14/juan-manuel-de-faraminan-y-gabriel-paredes-chavez-hablan-de-ia-y-etica/3308652",

    image: {
      src: "/img/medios/filosofia-etica-era-digital.jpg",
      alt: "Juan Manuel de Faramiñán y Gabriel Paredes Chávez en la entrevista de Diario Libre",
    },

  },

  {

    id: "momentos-crisis-oportunidades",

    title: "Momentos de crisis, grandes oportunidades",

    outlet: "Camino al Sol",

    kind: "Entrevista",

    people: "María Eugenia Ríos-Lamas",

    excerpt:

      "Desde una mirada humanista, nuestra directora fundadora invita a entender la crisis no como un obstáculo, sino como un escenario fértil para el aprendizaje, la resiliencia y la transformación personal.",

    url: "https://caminoalsol.do/maria-eugenia-rios-lamas-momentos-de-crisis-grandes-oportunidades/",

    image: {
      src: "/img/medios/momentos-crisis-oportunidades.jpg",
      alt: "Ilustración de una persona cultivando un árbol con forma de cerebro al atardecer",
    },

  },

  {

    id: "conflictos-retos-oportunidades",

    title: "Los conflictos como retos y oportunidades",

    outlet: "Barna Management School",

    kind: "Charla",

    people: "Eva Rodríguez y Gabriel Paredes",

    excerpt:

      "Una charla-coloquio para mirar los conflictos desde otra perspectiva: comprenderlos como inevitables y necesarios para el desarrollo, y desarrollar la habilidad de negociar buscando soluciones que beneficien a todas las partes.",

    url: "https://www.linkedin.com/feed/update/urn:li:activity:7463735096928530433/",

    image: {
      src: "/img/medios/conflictos-retos-oportunidades.jpg",
      alt: "Participantes en la charla-coloquio de Barna Management School",
    },

  },

];



/** Tarjetas definidas en código; en el CMS solo se pueden ocultar, no borrar del repo. */
export function isSeedMedio(id: string): boolean {
  return MEDIOS.some((m) => m.id === id);
}

