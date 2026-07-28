// Viajes culturales de Nueva Acrópolis RD — locales e internacionales.

export type ViajeCategoriaSlug = "locales" | "internacionales";

export type ViajeDestino = {
  slug: string;
  categoria: ViajeCategoriaSlug;
  title: string;
  location: string;
  duration?: string;
  excerpt: string;
  image: { src: string; alt: string };
  body: string[];
  highlights: string[];
  /** Próxima salida programada (texto libre, ej. «Sábado 22 de marzo»). */
  proximaFecha?: string;
  /** Enlace personalizado (WhatsApp, formulario, URL externa). */
  link?: string;
  /** Si es true, la tarjeta solo enlaza a `link` sin página de detalle. */
  soloEnlace?: boolean;
};

export type ViajeCategoria = {
  slug: ViajeCategoriaSlug;
  title: string;
  lede: string;
  intro: string;
  heroImage: { src: string; alt: string };
};

/** Texto promocional en la sección Viajes de /cultura. */
export const VIAJE_PROMO_CARD_TEXT: Record<ViajeCategoriaSlug, string> = {
  locales:
    "Los Tres Ojos, las Cuevas de Pomier y otros sitios de República Dominicana para redescubrir patrimonio, naturaleza e historia con una mirada filosófica.",
  internacionales:
    "Expediciones a Egipto, Machu Picchu y otras cunas de la civilización para vivir de cerca el arte, la arquitectura y la espiritualidad de los grandes pueblos.",
};

export const VIAJE_CATEGORIAS: Record<ViajeCategoriaSlug, ViajeCategoria> = {
  locales: {
    slug: "locales",
    title: "Viajes locales",
    lede: "Patrimonio, naturaleza y historia de República Dominicana.",
    intro:
      "Salidas de un día o fin de semana a sitios históricos y naturales del país. Cada excursión combina caminata, observación y reflexión sobre el lugar que habitamos.",
    heroImage: {
      src: "/img/cultura/viajes/tres-ojos.webp",
      alt: "Grupo de Nueva Acrópolis en excursión local",
    },
  },
  internacionales: {
    slug: "internacionales",
    title: "Viajes internacionales",
    lede: "Expediciones culturales a las cunas de la civilización.",
    intro:
      "Viajes de varios días para acercarnos al arte, la arquitectura y la espiritualidad de los grandes pueblos. Grupos reducidos, guías especializados y un enfoque filosófico en cada parada.",
    heroImage: {
      src: "/img/cultura/viajes/egipto.webp",
      alt: "Expedición cultural internacional de Nueva Acrópolis",
    },
  },
};

export const VIAJES_DESTINOS: ViajeDestino[] = [
  {
    slug: "los-tres-ojos",
    categoria: "locales",
    title: "Los Tres Ojos",
    location: "Parque Nacional Los Tres Ojos, Santo Domingo Este",
    duration: "Medio día",
    excerpt:
      "Excursión al parque de cuevas y lagos subterráneos más visitado del país: naturaleza, geología y simbolismo del agua.",
    image: {
      src: "/img/cultura/viajes/tres-ojos.webp",
      alt: "Laguna azul turquesa en el Parque Nacional Los Tres Ojos",
    },
    highlights: [
      "Recorrido por las cuatro lagunas del parque",
      "Lago de azufre y la cueva «La Nevera»",
      "Reflexión sobre el agua como símbolo de vida",
    ],
    body: [
      "Los Tres Ojos es uno de los espacios naturales más singulares del Gran Santo Domingo: un conjunto de lagunas de agua dulce dentro de cuevas de piedra caliza, formadas hace miles de años. Nueva Acrópolis organiza salidas para redescubrir este parque con una mirada que combina geología, historia y simbolismo.",
      "El recorrido inicia en la laguna Agua Azul, de tono turquesa intenso, y continúa hacia la Laguna de Azufre y la famosa «Nevera», donde la temperatura desciende de forma sorprendente. En cada parada compartimos observaciones sobre la formación del paisaje kárstico y el papel del agua en las tradiciones de los pueblos originarios del Caribe.",
      "La excursión incluye tiempo para caminar con calma, tomar fotografías y conversar sobre cómo la naturaleza nos invita a la contemplación. Es una salida apta para familias y para quienes se acercan por primera vez a las propuestas culturales de la escuela.",
    ],
  },
  {
    slug: "cuevas-de-pomier",
    categoria: "locales",
    title: "Cuevas de Pomier",
    location: "San Cristóbal",
    duration: "Día completo",
    excerpt:
      "Visita al mayor santuario rupestre del Caribe: más de cuatro mil petroglifos y pictografías taínas en un entorno de bosque seco.",
    image: {
      src: "/img/cultura/viajes/pomier.webp",
      alt: "Petroglifos taínos en las Cuevas de Pomier, San Cristóbal",
    },
    highlights: [
      "Guía especializado en arqueología taína",
      "Cuevas Número 1 y 18 con arte rupestre",
      "Contexto histórico de los pueblos originarios",
    ],
    body: [
      "Las Cuevas de Pomier, en el municipio de San Cristóbal, albergan uno de los conjuntos de arte rupestre más importantes del hemisferio: miles de grabados y pinturas dejados por los taínos y culturas anteriores. Nueva Acrópolis propone una jornada para acercarnos a este patrimonio con respeto y profundidad.",
      "Con guía local recorremos senderos entre bosque seco y visitamos cuevas seleccionadas donde podemos observar espirales, antropomorfos y escenas de la vida cotidiana de quienes habitaron la isla antes del contacto europeo. Comentamos el simbolismo de los signos y su relación con el cosmos y la agricultura.",
      "La salida incluye transporte coordinado desde Santo Domingo, refrigerio y un espacio final de diálogo sobre la memoria colectiva y la responsabilidad de proteger estos sitios. Se recomienda calzado cómodo y ropa ligera.",
    ],
  },
  {
    slug: "egipto",
    categoria: "internacionales",
    title: "Egipto",
    location: "El Cairo, Luxor y Aswan",
    duration: "10 días",
    excerpt:
      "Expedición a las pirámides de Giza, el Valle de los Reyes y los templos del Nilo: historia viva de una de las civilizaciones más influyentes.",
    image: {
      src: "/img/cultura/viajes/egipto.webp",
      alt: "Grupo de Nueva Acrópolis frente a las pirámides de Giza",
    },
    highlights: [
      "Pirámides de Giza y la Esfinge",
      "Templos de Karnak y Luxor",
      "Crucero por el Nilo hasta Aswan",
    ],
    body: [
      "Egipto concentra en pocas millas uno de los legados más fascinantes de la humanidad. Nueva Acrópolis organiza expediciones culturales para recorrer sus monumentos no solo como turistas, sino como estudiantes de la historia del pensamiento y de las tradiciones iniciáticas del antiguo mundo.",
      "El itinerario incluye El Cairo —con las pirámides de Giza y el Museo Egipcio— y un viaje al alto Egipto: Luxor, el Valle de los Reyes y los templos de Karnak y Hatshepsut. En cada sitio dedicamos tiempo a la lectura simbólica de la arquitectura, la escultura y los textos jeroglíficos.",
      "Los grupos son reducidos y viajan con guías egiptólogos y acompañantes de Nueva Acrópolis. Las fechas se publican con antelación en nuestras redes; quienes deseen información pueden escribirnos por WhatsApp para recibir el dossier del próximo viaje.",
    ],
  },
  {
    slug: "machu-picchu",
    categoria: "internacionales",
    title: "Machu Picchu",
    location: "Cusco y Valle Sagrado, Perú",
    duration: "8 días",
    excerpt:
      "Ruta por la capital inca, el Valle Sagrado y la ciudadela de Machu Picchu: arquitectura, astronomía y espiritualidad andina.",
    image: {
      src: "/img/cultura/viajes/machu-picchu.webp",
      alt: "Ciudadela inca de Machu Picchu entre las montañas andinas",
    },
    highlights: [
      "Cusco y Qorikancha",
      "Valle Sagrado: Ollantaytambo y Pisac",
      "Machu Picchu al amanecer",
    ],
    body: [
      "Machu Picchu es mucho más que una postal: es un testimonio de la ingeniería, la astronomía y la cosmovisión inca. Nueva Acrópolis propone una expedición que recorre Cusco, el Valle Sagrado y la ciudadela, integrando historia, paisaje y reflexión sobre la relación entre el ser humano y la montaña.",
      "La ruta incluye la ciudad imperial de Cusco, el templo de Qorikancha, los mercados artesanales de Pisac y la fortaleza de Ollantaytambo antes de subir en tren hacia Aguas Calientes. La visita a Machu Picchu se realiza al amanecer, cuando la niebla se levanta sobre las terrazas y los templos del Sol y de las Tres Ventanas.",
      "Como en todas nuestras expediciones internacionales, el viaje combina visitas guiadas, tiempo libre para la contemplación y encuentros de grupo para compartir lecturas sobre la sabiduría andina. Consulta fechas y requisitos de inscripción en nuestras sedes o por WhatsApp.",
    ],
  },
];

export function viajeKey(v: { categoria: string; slug: string }): string {
  return `${v.categoria}/${v.slug}`;
}

export function getViajeCategoria(slug: string): ViajeCategoria | undefined {
  return VIAJE_CATEGORIAS[slug as ViajeCategoriaSlug];
}

export function getViajesByCategoria(
  categoria: ViajeCategoriaSlug,
): ViajeDestino[] {
  return VIAJES_DESTINOS.filter((v) => v.categoria === categoria);
}

export function getViajeDestino(
  categoria: string,
  slug: string,
): ViajeDestino | undefined {
  return VIAJES_DESTINOS.find(
    (v) => v.categoria === categoria && v.slug === slug,
  );
}

export function viajeCategoriaHref(categoria: ViajeCategoriaSlug): string {
  return `/cultura/viajes/${categoria}/`;
}

export function viajeDestinoHref(
  categoria: ViajeCategoriaSlug,
  slug: string,
): string {
  return `/cultura/viajes/${categoria}/${slug}/`;
}
