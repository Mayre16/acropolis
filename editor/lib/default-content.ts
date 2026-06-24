import type { CmsDocument, SiteId } from "./content-types";

/** Contenido inicial — copia de los defaults del código fuente de principal. */
export function createDefaultContent(site: SiteId): CmsDocument {
  const base: CmsDocument = {
    version: 1,
    site,
    updatedAt: new Date().toISOString(),
    sections: {},
  };

  if (site === "acropolis") {
    base.sections = {
      homeHero: {
        h1: "Filosofía, Cultura y Voluntariado",
        background: {
          src: "/img/home/hero-voluntarios-chalecos.webp",
          alt: "Voluntarios de Nueva Acrópolis en unidad, con chalecos verdes y azules",
        },
      },
      diplomadoHero: {
        badgeWeekday: "Lunes",
        badgeDate: "29 JUN",
        activeLabel: "Sesión en curso",
        activeDate: "Lunes 29 de junio",
        activeTime: "7:00 – 9:15 p.m.",
        activeModality: "Presencial",
      },
      agenda: [
        {
          id: "diplomado-sd-jun29",
          category: "diplomado",
          title: "Diplomado de Filosofía para la Vida",
          startsAt: "2026-06-29",
          date: "Lunes 29 de junio",
          time: "7:00 – 9:15 p.m.",
          sede: "Presencial · Santo Domingo",
          tag: "Sesión en curso",
          image: "/img/filosofia/diplomado/diplomado-01.webp",
          imageAlt: "Diplomado de Filosofía para la Vida",
          showOnHome: true,
          detailHref: "/filosofia",
          detailLabel: "Ver programa completo",
        },
        {
          id: "conferencia-arte-vivir-jul16",
          category: "conferencia",
          title: "El arte de vivir con propósito",
          startsAt: "2026-07-16",
          date: "Miércoles 16 de julio",
          time: "7:00 p.m.",
          sede: "Sede Naco · Santo Domingo",
          tag: "Abierta y gratuita",
          image: "/img/eventos/arte-vivir-proposito.webp",
          imageAlt: "Conferencia El arte de vivir con propósito",
          showOnHome: true,
          detailHref: "/cursos",
          detailLabel: "Ver cursos y conferencias",
        },
      ],
      eventos: [],
      articulos: [],
    };
  } else {
    base.sections = {
      homeHero: {
        h1: "Civis Consulting",
        h2: "Talleres para empresas y equipos",
        lede:
          "Comunicación, convivencia y liderazgo al servicio de las organizaciones.",
      },
      agenda: [],
    };
  }

  return base;
}
