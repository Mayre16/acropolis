/** Catálogo de cursos, talleres y conferencias culturales abiertas al público. */

export type OfertaCurso = {
  /** Id estable en catálogo/CMS (p. ej. `curso-crochet`). */
  id?: string;
  src: string;
  alt: string;
  title: string;
  text: string;
  facilitador?: string;
  sede?: string;
  /** Horario fijo recurrente (ej. «Martes y jueves · 7:00 a.m. – 9:00 a.m.»). */
  horario?: string;
  /** Curso permanente con horario fijo (Tai Chi, crochet, etc.). */
  recurrent?: boolean;
  /** Etiqueta temática (Bienestar, Arte…). */
  tag?: string;
  /** Para conferencias: «Abierta y gratuita», etc. */
  accessLabel?: string;
  inscribeKind?: "curso" | "taller" | "actividad" | "conferencia";
  inscribeLabel?: string;
};

export const CURSOS_TALLERES: OfertaCurso[] = [
  {
    src: "/img/cursos/respirar.webp",
    alt: "Taller El arte de respirar — respiración consciente y equilibrio interior",
    title: "El arte de respirar",
    text: "Redescubre la respiración consciente como herramienta de calma, atención y bienestar. Ejercicios guiados para hacer una pausa del ritmo cotidiano y reconectar con el cuerpo.",
    tag: "Bienestar",
    sede: "Punto Cultural Roberto Pastoriza",
    horario: "Consultar horario vigente",
  },
  {
    src: "/img/cursos/pintura.webp",
    alt: "Taller de pintura con participantes frente a sus caballetes",
    title: "Taller de pintura",
    text: "Desarrolla la sensibilidad artística a través del color y la forma. Un espacio creativo para expresar ideas, observar con atención y disfrutar del proceso de pintar.",
    tag: "Arte",
    horario: "Sábados 10:00 a.m.",
  },
  {
    id: "curso-circulo-de-lectura",
    src: "/img/cursos/lectura.webp",
    alt: "Círculo de lectura con grupo conversando sobre libros",
    title: "Círculo de lectura",
    text: "Leer y dialogar en grupo sobre textos que invitan a pensar. Un encuentro para compartir ideas, profundizar en autores y descubrir nuevas miradas sobre la vida.",
    tag: "Cultura",
    horario: "Último jueves de cada mes",
    recurrent: true,
  },
  {
    id: "curso-tai-chi-y-chi-kung",
    src: "/img/cursos/chi-kung-salon.webp",
    alt: "Grupo practicando Tai Chi y Chi Kung en salón con espejo y piso de madera",
    title: "Tai Chi y Chi Kung",
    text: "Curso recurrente de movimientos suaves y respiración profunda: meditación en movimiento que mejora equilibrio, flexibilidad y calma mental. Apto para todas las edades, sin impacto. Inversión: RD$3,000 mensuales.",
    facilitador: "Daniel Salinas",
    sede: "Sede Los Prados",
    tag: "Bienestar",
    horario: "Martes y jueves · 7:00 a.m. – 9:00 a.m.",
    recurrent: true,
  },
  {
    src: "/img/cursos/bienestar.webp",
    alt: "Taller de conciencia y bienestar con prácticas de atención plena",
    title: "Conciencia y bienestar",
    text: "Herramientas prácticas para cultivar presencia, equilibrio emocional y armonía interior. Integra cuerpo, respiración y reflexión en un camino de cuidado personal.",
    tag: "Bienestar",
    horario: "Consultar horario vigente",
  },
  {
    src: "/img/cursos/conflictos.webp",
    alt: "Taller sobre liderar conflictos con inteligencia en grupo",
    title: "Liderar conflictos con inteligencia",
    text: "Aprende a abordar desacuerdos con claridad, empatía y estrategia. Desarrolla habilidades de comunicación y convivencia para resolver tensiones de forma constructiva.",
    tag: "Comunicación",
    horario: "Por convocatoria",
  },
  {
    src: "/img/cursos/astrologia.webp",
    alt: "Carta astral y símbolos del zodíaco sobre una mesa de estudio",
    title: "Astrología filosófica",
    text: "El lenguaje simbólico del cosmos como espejo del mundo interior. Descubre la relación entre el ser humano y el universo a través de la carta astral. Niveles I y II.",
    facilitador: "Daniel Salinas",
    sede: "Sede Los Prados",
    horario: "Consultar horario vigente",
  },
  {
    src: "/img/cursos/oratoria.webp",
    alt: "Persona exponiendo ante un grupo en un taller de oratoria",
    title: "Oratoria",
    text: "La palabra como herramienta de valor. Gana claridad en la expresión, buen lenguaje corporal y seguridad para hablar en público.",
    tag: "Comunicación",
    horario: "Por convocatoria",
  },
  {
    id: "curso-crochet",
    src: "/img/cursos/crochet.webp",
    alt: "Manos tejiendo a crochet con ovillos de lana de colores",
    title: "Crochet con confianza",
    text: "Aprende crochet paso a paso en un ambiente de encuentro y paciencia: mejora la concentración, reduce el estrés y desarrolla motricidad fina mientras creas piezas únicas.",
    facilitador: "Jeimy Troncoso",
    sede: "Sede Naco",
    tag: "Arte y oficio",
    horario: "Sábados · 10:00 a.m. – 12:00 p.m.",
    recurrent: true,
  },
  {
    id: "curso-circulo-de-amigos",
    src: "/img/circulo-amigos/conversacion.webp",
    alt: "Personas de distintas edades conversando en círculo — Círculo de Amigos Nueva Acrópolis",
    title: "Círculo de Amigos",
    text: "Red abierta para quienes comparten los principios de Nueva Acrópolis y desean dialogar sobre filosofía, cultura y voluntariado sin integrarse al plan de estudios regular.",
    tag: "Filosofía",
    horario: "Miércoles · encuentro virtual semanal",
    recurrent: true,
    inscribeKind: "actividad",
    inscribeLabel: "Quiero unirme",
  },
];

export const CURSOS_EVENTOS_RECIENTES_SECTION = {
  eyebrow: "Crónicas",
  title: "Cursos y talleres que ya vivimos",
  intro:
    "Notas de encuentros y convocatorias recientes. Cada tarjeta enlaza a la crónica completa en Eventos.",
} as const;

/** @deprecated Las conferencias se gestionan en agenda, no en el catálogo de cursos. */
export const CONFERENCIAS_CULTURALES: OfertaCurso[] = [
  {
    src: "/img/eventos/arte-vivir-proposito.webp",
    alt:
      "Conferencia «El arte de vivir con propósito» — filosofía práctica y sentido de la vida, Sede Naco",
    title: "El arte de vivir con propósito",
    text: "Conferencia cultural para explorar la filosofía como herramienta práctica: encontrar sentido, fortalecer la voluntad y orientar decisiones cotidianas a la luz de las grandes tradiciones de Oriente y Occidente. Entrada libre; cupos limitados.",
    accessLabel: "Abierta y gratuita",
    sede: "Sede Naco · Santo Domingo",
    inscribeKind: "conferencia",
    inscribeLabel: "Quiero asistir",
  },
];
