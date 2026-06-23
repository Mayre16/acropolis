/**
 * Carruseles de hero por sección — cada página tiene su propio set de fotos
 * reales, sin repetir las mismas imágenes entre secciones.
 */
export type HeroImage = {
  src: string;
  alt: string;
  /** Si es "video", `src` apunta a un archivo de vídeo (mp4/webm). */
  media?: "image" | "video";
  /** Imagen de respaldo mientras carga el vídeo o con prefers-reduced-motion. */
  poster?: string;
};

/** Foto fija del hero de inicio — voluntarios con chalecos en unidad. */
export const HOME_HERO_BACKGROUND = {
  src: "/img/home/hero-voluntarios-chalecos.webp",
  alt: "Voluntarios de Nueva Acrópolis en unidad, con chalecos verdes y azules",
} as const;

/** Inicio — panorama general de la organización. */
export const HOME_HERO_IMAGES: HeroImage[] = [
  { src: "/img/eventos/feria-salud.webp", alt: "Voluntarios de Nueva Acrópolis en la Feria de la Salud" },
  { src: "/img/actividades/noche-estrellas.webp", alt: "Celebración cultural al aire libre" },
  { src: "/img/cultura/talleres/teatro.webp", alt: "Grupo de teatro de Nueva Acrópolis en escena" },
  { src: "/img/cultura/viajes/zona-colonial.webp", alt: "Excursión cultural a la Zona Colonial" },
  { src: "/img/eventos/tierra.webp", alt: "Actividad comunitaria del Día de la Tierra" },
  { src: "/img/cultura/talleres/danza.webp", alt: "Clase de danza con trajes típicos dominicanos" },
  { src: "/img/actividades/cineforum.webp", alt: "Cine-fórum filosófico de Nueva Acrópolis" },
];

/** Escuela de Filosofía — imágenes alegóricas (biblioteca, sabiduría clásica, Oriente y Occidente). */
export const FILOSOFIA_HERO_IMAGES: HeroImage[] = [
  { src: "/img/hero/filosofia/02.webp", alt: "Biblioteca y la luz del conocimiento filosófico" },
  { src: "/img/hero/filosofia/05.webp", alt: "Biblioteca circular — el camino del saber" },
  { src: "/img/hero/filosofia/01.webp", alt: "Libro abierto en la biblioteca — filosofía como búsqueda" },
  { src: "/img/filosofia/diplomado/diplomado-01.webp", alt: "Parthenon y pensamiento clásico de Grecia" },
  { src: "/img/filosofia/diplomado/diplomado-02.webp", alt: "Pirámides y cosmos — sabiduría de las civilizaciones" },
  { src: "/img/filosofia/diplomado/diplomado-03.webp", alt: "Símbolos de Oriente y tradiciones universales" },
  { src: "/img/filosofia/modulos/etica.webp", alt: "Busto clásico — ética y autoconocimiento" },
  { src: "/img/filosofia/modulos/historia.webp", alt: "Templo griego — historia del pensamiento" },
  { src: "/img/home/grecia.webp", alt: "Raíces clásicas de la filosofía" },
];

/** Cultura — talleres, eventos y viajes. */
export const CULTURA_HERO_IMAGES: HeroImage[] = [
  { src: "/img/cultura/talleres/coro.webp", alt: "Coro mixto de Nueva Acrópolis en ensayo" },
  {
    src: "/video/cultura/baile.mp4",
    alt: "Baile y danza en actividad cultural de Nueva Acrópolis",
    media: "video",
    poster: "/img/cultura/talleres/danza.webp",
  },
  { src: "/img/cultura/talleres/jovenes.webp", alt: "Actividades culturales para jóvenes" },
  { src: "/img/cultura/eventos/midsommar.webp", alt: "Celebración Bienvenida Primavera" },
  { src: "/img/cultura/eventos/velada.webp", alt: "Velada cultural con cuarteto de cuerdas" },
  { src: "/img/cultura/viajes/egipto.webp", alt: "Expedición cultural a las pirámides de Giza" },
  { src: "/img/cultura/viajes/tres-ojos.webp", alt: "Excursión a los Tres Ojos, Santo Domingo" },
];

/** Voluntariado — acción solidaria y ambiental. */
export const VOLUNTARIADO_HERO_IMAGES: HeroImage[] = [
  { src: "/img/voluntariado/cards/ecologia.webp", alt: "Voluntarios en jornada de reforestación" },
  { src: "/img/voluntariado/cards/ninos.webp", alt: "Jornada de servicio con niños" },
  { src: "/img/voluntariado/cards/ancianos.webp", alt: "Visita solidaria a hogar de ancianos" },
  { src: "/img/voluntariado/cards/playa.webp", alt: "Limpieza de playa con voluntarios" },
  { src: "/img/eventos/simulacros.webp", alt: "Capacitación en gestión de emergencias" },
  { src: "/img/actividades/unibe.webp", alt: "Nueva Acrópolis en la Feria de Voluntariado de UNIBE" },
];

/** Cursos y talleres — bienestar, arte y comunicación (fotos distintas a las tarjetas). */
export const CURSOS_HERO_IMAGES: HeroImage[] = [
  { src: "/img/cursos/respirar.webp", alt: "Taller El arte de respirar" },
  { src: "/img/cursos/pintura.webp", alt: "Taller de pintura" },
  { src: "/img/cursos/chi-kung-salon.webp", alt: "Grupo visto de espaldas practicando Chi Kung en salón con espejo y piso de madera" },
  { src: "/img/cursos/astrologia.webp", alt: "Astrología filosófica" },
];

/** Eventos — programación y celebraciones. */
export const EVENTOS_HERO_IMAGES: HeroImage[] = [
  { src: "/img/cultura/eventos/midsommar.webp", alt: "Bienvenida Primavera" },
  { src: "/img/eventos/santiago.webp", alt: "Lanzamiento del Diplomado en Santiago" },
  { src: "/img/eventos/abejas.webp", alt: "Charla sobre el valor de las abejas" },
  { src: "/img/cultura/viajes/tres-ojos.webp", alt: "Excursión cultural a los Tres Ojos" },
  { src: "/img/eventos/simulacros.webp", alt: "Simulacro de gestión de emergencias" },
  { src: "/img/cultura/viajes/zona-colonial.webp", alt: "Viaje cultural a la Zona Colonial" },
];

/** Artículos — imágenes alegóricas (lectura, sabiduría clásica, símbolos). */
export const ARTICULOS_HERO_IMAGES: HeroImage[] = [
  { src: "/img/hero/filosofia/01.webp", alt: "Libro abierto en la biblioteca — filosofía como búsqueda" },
  { src: "/img/hero/filosofia/05.webp", alt: "Biblioteca circular — el camino del saber" },
  { src: "/img/hero/filosofia/02.webp", alt: "Biblioteca y la luz del conocimiento filosófico" },
  { src: "/img/filosofia/modulos/etica.webp", alt: "Busto clásico — ética y autoconocimiento" },
  { src: "/img/filosofia/modulos/historia.webp", alt: "Templo griego — historia del pensamiento" },
  { src: "/img/articulos/simbolismo-de-la-escalera.webp", alt: "Simbolismo de la escalera" },
];

/** Quiénes somos — la organización y su gente. */
export const QUIENES_SOMOS_HERO_IMAGES: HeroImage[] = [
  { src: "/img/home/grecia.webp", alt: "Nueva Acrópolis — raíces clásicas de la filosofía" },
  { src: "/img/eventos/santiago.webp", alt: "Actividad de Nueva Acrópolis en Santiago de los Caballeros" },
  { src: "/img/cultura/viajes/egipto.webp", alt: "Expedición cultural internacional" },
  { src: "/img/cultura/talleres/coro.webp", alt: "Comunidad cultural de Nueva Acrópolis" },
  { src: "/img/actividades/unibe.webp", alt: "Presencia en la Feria de Voluntariado universitaria" },
];

/** Agenda — actividades programadas con fecha próxima. */
export const AGENDA_HERO_IMAGES: HeroImage[] = [
  {
    src: "/img/contenido/agenda-itinerario.webp",
    alt: "Agenda e itinerario de actividades — calendario, fechas y sedes",
  },
  { src: "/img/eventos/feria-salud.webp", alt: "Voluntarios de Nueva Acrópolis en la Feria de la Salud" },
  { src: "/img/actividades/cineforum.webp", alt: "Cine-fórum filosófico de Nueva Acrópolis" },
  { src: "/img/cultura/talleres/danza.webp", alt: "Clase de danza en actividad cultural" },
  { src: "/img/eventos/abejas.webp", alt: "Charla sobre el valor de las abejas y la naturaleza" },
  { src: "/img/actividades/noche-estrellas.webp", alt: "Celebración cultural al aire libre" },
];

/** Relaciones institucionales — alianzas y presencia pública. */
export const RELACIONES_HERO_IMAGES: HeroImage[] = [
  { src: "/img/eventos/feria-salud.webp", alt: "Participación en la Feria de la Salud" },
  { src: "/img/actividades/unibe.webp", alt: "Colaboración con la comunidad universitaria" },
  { src: "/img/eventos/simulacros.webp", alt: "Capacitación en gestión de emergencias" },
  { src: "/img/eventos/tierra.webp", alt: "Actividades de responsabilidad social y ambiental" },
  { src: "/img/eventos/abejas.webp", alt: "Charla abierta sobre ciencia y filosofía" },
];

/** Punto Focal Esfera — talleres, simulacros y formación humanitaria. */
export const ESFERA_HERO_IMAGES: HeroImage[] = [
  { src: "/img/eventos/simulacros.webp", alt: "Simulacro de gestión de emergencias con voluntarios" },
  { src: "/img/esfera/cards/normas.webp", alt: "Taller sobre estándares humanitarios Esfera" },
  { src: "/img/esfera/cards/gestion.webp", alt: "Ejercicio de evaluación de daños en formación Esfera" },
  { src: "/img/esfera/cards/comunidad.webp", alt: "Equipo comunitario en capacitación humanitaria" },
];
