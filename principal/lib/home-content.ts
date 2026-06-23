import { SOCIAL_LINKS } from "./site-config";

export type ActivityPhoto = {
  src: string;
  alt: string;
  caption?: string;
};

/** Máximo de fotos visibles en la home. */
export const HOME_ACTIVITY_PHOTOS_LIMIT = 6;

/** Fotos de actividades — imágenes limpias para la home. */
export const ACTIVITY_PHOTOS: ActivityPhoto[] = [
  {
    src: "/img/actividades/voluntariado-santa-rosa.webp",
    alt: "Voluntariado en Santa Rosa de Lima",
    caption: "Voluntariado comunitario",
  },
  {
    src: "/img/actividades/teatro-juvenil.webp",
    alt: "Presentación de teatro juvenil",
    caption: "Teatro y cultura",
  },
  {
    src: "/img/actividades/campamento-dirigentes.webp",
    alt: "Campamento de dirigentes juveniles",
    caption: "Formación de líderes",
  },
  {
    src: "/img/actividades/liderazgo-juvenil.webp",
    alt: "Campamento de liderazgo juvenil",
    caption: "Liderazgo juvenil",
  },
  {
    src: "/img/actividades/dia-madre-tierra.webp",
    alt: "Día Internacional de la Madre Tierra",
    caption: "Día de la Tierra",
  },
  {
    src: "/img/actividades/dia-medio-ambiente.webp",
    alt: "Día mundial del medio ambiente",
    caption: "Medio ambiente",
  },
];

export type InstagramPost = {
  src: string;
  alt: string;
  href: string;
};

/** Publicaciones recientes — @nuevaacropolisdominicana (imágenes locales WebP). */
export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    src: "/img/instagram/DTCD1NHjusg.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DTCD1NHjusg/",
  },
  {
    src: "/img/instagram/C9vFlxtvJCl.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/C9vFlxtvJCl/",
  },
  {
    src: "/img/instagram/DBCAWHxN9KE.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DBCAWHxN9KE/",
  },
  {
    src: "/img/instagram/DF2xM_5uMgW.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DF2xM_5uMgW/",
  },
  {
    src: "/img/instagram/DML_C8Rvrxa.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DML_C8Rvrxa/",
  },
  {
    src: "/img/instagram/DJNajckqkUA.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DJNajckqkUA/",
  },
];
