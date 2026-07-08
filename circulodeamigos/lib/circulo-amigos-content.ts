/** Círculo de Amigos OINADOM — contenido basado en acropolis.org.do/circulo-de-amigos/ */

export const CIRCULO_AMIGOS_PATH = "/circulo-de-amigos";

/** Azul claro OINA (submarca) — placeholder hasta confirmar tono exacto del manual. */
export const CIRCULO_AMIGOS_BRAND = {
  light: "#7EC8F0",
  main: "#53A3DA",
  dark: "#3A9AD4",
  deep: "#2E8BC7",
  surface: "#E8F4FC",
} as const;

/** @deprecated Usar INFO_EMAIL vía buildCirculoAmigosInscriptionMailto. */
export const CIRCULO_AMIGOS_EMAIL = "amigos_dominicana@acropolis.org";

export const CIRCULO_AMIGOS_IMAGE = {
  src: "/img/circulo-amigos/hero-conectate.webp",
  alt: "Personas conectándose en el Círculo de Amigos de Nueva Acrópolis",
} as const;

export const CIRCULO_AMIGOS_INTRO_IMAGES = {
  /** Cinta de inauguración — foto lateral de «¿Qué es?» */
  foto: {
    src: "/img/circulo-amigos/banner-quienes.webp",
    alt: "Inauguración del Círculo de Amigos de Nueva Acrópolis",
  },
} as const;

export const CIRCULO_AMIGOS_HERO = {
  eyebrow: "Círculo de Amigos OINADOM",
  title:
    "¿Te has sentido atraído por la filosofía y por la idea de un mundo mejor?",
  subtitle: "Tu camino hacia la sabiduría y el servicio comienza aquí",
  lede:
    "El Círculo de Amigos es tu espacio para conectar con personas que comparten tus valores y participar activamente en actividades que transforman la sociedad.",
} as const;

export const CIRCULO_AMIGOS_LEDE =
  "Un espacio abierto para quienes valoran los principios de Nueva Acrópolis y desean estar vinculados y participando en sus actividades, sin la necesidad de integrarse como miembros regulares.";

export const CIRCULO_AMIGOS_INTRO = [
  "El Círculo de Amigos es un espacio abierto para quienes valoran los principios de Nueva Acrópolis y desean estar vinculados y participando en sus actividades, sin la necesidad de integrarse como miembros regulares.",
  "A lo largo de los años hemos conocido a muchas personas que se interesan y valoran nuestra labor, pero cuyas ocupaciones personales, profesionales o la distancia no les permiten un contacto más cercano. Este círculo está pensado para ellos.",
] as const;

export const CIRCULO_AMIGOS_PILARES = [
  {
    title: "Fraternidad",
    text: "Promovemos un ideal de fraternidad basado en el respeto a la dignidad humana, más allá de cualquier diferencia.",
    image: "/img/circulo-amigos/grupo-dialogo.webp",
  },
  {
    title: "Conocimiento",
    text: "Fomentamos el amor a la sabiduría a través del estudio ecléctico para el conocimiento del ser humano y la naturaleza.",
    image: "/img/circulo-amigos/conecta-mundo.webp",
  },
  {
    title: "Desarrollo",
    text: "Buscamos desarrollar lo mejor de cada ser humano promoviendo su realización individual y su rol activo en la sociedad.",
    image: "/img/circulo-amigos/acciones-sociales.webp",
  },
] as const;

export const CIRCULO_AMIGOS_BENEFICIOS = [
  {
    title: "Participar en actividades únicas",
    text: "Acceso a una programación mensual exclusiva: diálogos filosóficos, caminatas reflexivas, talleres de bienestar y jornadas de voluntariado.",
    image: "/img/circulo-amigos/pilar-fraternidad.webp",
  },
  {
    title: "Conectarte con el mundo",
    text: "Colaborar en proyectos internacionales de Nueva Acrópolis, como el Día de la Filosofía, el Día de la Tierra y el Día de las Artes.",
    image: "/img/circulo-amigos/pilar-conocimiento.webp",
  },
  {
    title: "Estar siempre informado",
    text: "Recibe novedades de encuentros, propuestas y actividades del Círculo de Amigos y de la organización.",
    image: "/img/circulo-amigos/pilar-desarrollo.webp",
  },
  {
    title: "Proponer tus ideas",
    text: "Colaborar en proyectos y proponer nuevas actividades para enriquecer a la comunidad.",
    image: "/img/circulo-amigos/beneficio-informado.webp",
  },
] as const;

export const CIRCULO_AMIGOS_PASOS = [
  {
    n: 1,
    title: "Inscríbete",
    text: "Completa el formulario digital con tus datos.",
    image: "/img/circulo-amigos/paso-inscribete.webp",
  },
  {
    n: 2,
    title: "Conéctate",
    text: "Es posible que te contactemos para una entrevista breve y conocer tus intereses y motivaciones.",
    image: "/img/circulo-amigos/paso-conecta.webp",
  },
  {
    n: 3,
    title: "Participa",
    text: "Una vez aceptado, recibirás la información de nuestras actividades y serás parte de la comunidad.",
    image: "/img/circulo-amigos/paso-participa.webp",
  },
] as const;

export const CIRCULO_AMIGOS_RECIBES = [
  "Participación en actividades periódicas exclusivas para los Amigos.",
  "Oportunidad de colaborar en proyectos nacionales e internacionales con impacto cultural y humanitario.",
  "Espacios de encuentro, amistad y reflexión compartida.",
  "Descuentos en múltiples actividades.",
  "Suscripción a la Revista Esfinge.",
] as const;

export const CIRCULO_AMIGOS_ESPERAMOS = [
  "Compartir los principios de Nueva Acrópolis.",
  "Mantener siempre una actitud de fraternidad, eclecticismo y un sano deseo de desarrollo personal.",
  "Contribuir con una cuota anual de apoyo de RD$2,500.00, que ayuda a sostener nuestras actividades y proyectos.",
] as const;

export const CIRCULO_AMIGOS_NOTA_LEGAL =
  "Nueva Acrópolis Dominicana se reserva el derecho de admisión y participación en el Círculo de Amigos. La información que nos compartes será utilizada únicamente para fines internos del Círculo de Amigos de Nueva Acrópolis Dominicana. Sin embargo, nos comprometemos a proteger tus datos personales y a no compartirlos con terceros sin tu consentimiento.";

export const CIRCULO_AMIGOS_HIGHLIGHTS = [
  {
    title: "Diálogo filosófico",
    text: "Conversaciones guiadas sobre ideas de Oriente y Occidente, aplicadas a la vida cotidiana.",
  },
  {
    title: "Sin plan de estudios",
    text: "Ideal si te interesa la filosofía pero no puedes comprometerte con el Diplomado o el programa regular.",
  },
  {
    title: "Comunidad activa",
    text: "Encuentros periódicos con personas de distintas generaciones en proyectos culturales y voluntariado.",
  },
] as const;

/** Bloque «Quiénes somos» — pestaña Círculo de Amigos. */
export const CIRCULO_QUIENES_SOMOS = {
  eyebrow: "Quiénes somos",
  title: "Círculo de Amigos OINADOM",
  paragraphs: CIRCULO_AMIGOS_INTRO,
  highlights: CIRCULO_AMIGOS_HIGHLIGHTS,
  naIntro: "El Círculo de Amigos forma parte de un ideal más amplio.",
  naButton: "Qué es Nueva Acrópolis",
} as const;

export const CIRCULO_QUIENES_SOMOS_PATH = "/quienes-somos";

export const CIRCULO_HOME_PATH = "/";
export const CIRCULO_INSCRIPCION_HASH = "inscribete";
export const CIRCULO_INSCRIPCION_HREF = `/#${CIRCULO_INSCRIPCION_HASH}`;

export const CIRCULO_FOOTER_NAV = [
  { id: "inicio", label: "Inicio", href: CIRCULO_HOME_PATH },
  {
    id: "quienes-somos",
    label: "Quiénes somos",
    href: CIRCULO_QUIENES_SOMOS_PATH,
  },
  { id: "inscripcion", label: "Inscríbete", href: null },
] as const;

/** Bloque «Qué es Nueva Acrópolis» (pestaña en Quiénes somos — mismo patrón que Civis / Editorial). */
export const CIRCULO_AMIGOS_NA_QUIENES = {
  title: "Qué es Nueva Acrópolis",
  heroImage: {
    src: "/img/home/grecia.webp",
    alt: "Visitante contemplando el Partenón en la Acrópolis de Atenas",
  },
  paragraphs: [
    "Nueva Acrópolis es una Escuela de Filosofía que promueve la cultura y practica el voluntariado. Propone un ideal de valores permanentes para contribuir a la evolución individual y colectiva.",
    "Desde hace más de 65 años, en más de 50 países, los programas de la Escuela de Filosofía han transformado la vida de miles de personas en todo el mundo.",
    "El Círculo de Amigos es la propuesta de Nueva Acrópolis para quienes valoran sus principios y desean participar en sus actividades sin integrarse como miembros regulares.",
  ],
  principios: [
    {
      title: "Fraternidad",
      text: "Promover un ideal de fraternidad basado en el respeto a la dignidad humana, más allá de las diferencias culturales, sociales o religiosas.",
    },
    {
      title: "Conocimiento",
      text: "Fomentar el amor a la sabiduría a través del estudio comparado de filosofías, religiones, ciencias y artes.",
    },
    {
      title: "Desarrollo",
      text: "Desarrollar lo mejor del ser humano, promoviendo su realización como individuo y como miembro activo de la sociedad.",
    },
  ],
  ctaIntro:
    "Conoce nuestra historia, actividades y sedes en República Dominicana.",
  ctaLabel: "Conocer Nueva Acrópolis",
} as const;

export const CIRCULO_AMIGOS_INSCRIPTION_DEFAULT_MESSAGE =
  "Solicito inscribirme en el Círculo de Amigos OINADOM. Me gustaría conocer los encuentros, horarios y requisitos para participar.";

export const CIRCULO_AMIGOS_WHATSAPP_MESSAGE =
  "Hola, me interesa conocer más sobre el Círculo de Amigos de Nueva Acrópolis. ¿Me pueden dar información?";

/** Mismo formulario que el Google Form embebido en acropolis.org.do/circulo-de-amigos/ */
export const CIRCULO_AMIGOS_GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe7pOZYaHXPXTB4KoB_NY192VNylhAOVc4Vj1QVVBZlABiwuQ/viewform";

export const CIRCULO_AMIGOS_DOCUMENT_TYPES = [
  { value: "cedula", label: "Cédula" },
  { value: "pasaporte", label: "Pasaporte" },
] as const;

export const CIRCULO_AMIGOS_REFERRAL_SOURCES = [
  { value: "referido", label: "Referido por un conocido" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "otra", label: "Otra vía" },
] as const;

export const CIRCULO_AMIGOS_INTEREST_AREAS = [
  { value: "filosofia", label: "Filosofía y reflexión" },
  { value: "cultura", label: "Cultura y arte" },
  { value: "voluntariado", label: "Voluntariado y acción social" },
  { value: "desarrollo", label: "Desarrollo personal" },
] as const;

export type CirculoDocumentType =
  (typeof CIRCULO_AMIGOS_DOCUMENT_TYPES)[number]["value"];
export type CirculoReferralSource =
  (typeof CIRCULO_AMIGOS_REFERRAL_SOURCES)[number]["value"];
export type CirculoInterestArea =
  (typeof CIRCULO_AMIGOS_INTEREST_AREAS)[number]["value"];

export type CirculoAmigosInscriptionValues = {
  email: string;
  nombre: string;
  tipoDocumento: CirculoDocumentType | "";
  numeroDocumento: string;
  fechaNacimiento: string;
  telefono: string;
  pais: string;
  ciudad: string;
  viaReferencia: CirculoReferralSource | "";
  motivacion: string;
  areasInteres: CirculoInterestArea[];
  confirmaCompromiso: boolean;
};

export const CIRCULO_AMIGOS_INSCRIPTION_INITIAL: CirculoAmigosInscriptionValues =
  {
    email: "",
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    fechaNacimiento: "",
    telefono: "",
    pais: "República Dominicana",
    ciudad: "",
    viaReferencia: "",
    motivacion: "",
    areasInteres: [],
    confirmaCompromiso: false,
  };
