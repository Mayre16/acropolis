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
    src: "/img/instagram/DbZKn1SEo-K.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DbZKn1SEo-K/",
  },
  {
    src: "/img/instagram/DbV9sNdEs9y.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DbV9sNdEs9y/",
  },
  {
    src: "/img/instagram/DbSy-n9lebg.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DbSy-n9lebg/",
  },
  {
    src: "/img/instagram/DbRyjM4kruj.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DbRyjM4kruj/",
  },
  {
    src: "/img/instagram/DbHMYWzkrhL.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DbHMYWzkrhL/",
  },
  {
    src: "/img/instagram/DbA6LIXEhMZ.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DbA6LIXEhMZ/",
  },
  {
    src: "/img/instagram/Da3ih2UkmeF.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/Da3ih2UkmeF/",
  },
  {
    src: "/img/instagram/Da3cNbQErY9.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/Da3cNbQErY9/",
  },
  {
    src: "/img/instagram/DavokKXElyr.webp",
    alt: "Publicación de @nuevaacropolisdominicana en Instagram",
    href: "https://www.instagram.com/p/DavokKXElyr/",
  },
];
