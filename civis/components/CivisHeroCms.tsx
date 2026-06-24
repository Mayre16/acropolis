"use client";

import { CivisHero } from "@/components/CivisHero";
import { CivisEditPencil } from "@/components/cms/CmsEditFields";
import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";
import { useCivisHeroText, useCivisHeroCarouselImages } from "@/lib/cms/hooks";

type Props = {
  title: string;
  lede: string;
  eyebrow?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function CivisHeroCms(props: Props) {
  const edit = useCivisCmsEdit();
  const images = useCivisHeroCarouselImages();
  const hero = useCivisHeroText({
    title: props.title,
    lede: props.lede,
    h2: props.subtitle,
    ctaHref: props.ctaHref,
    ctaLabel: props.ctaLabel,
  });

  return (
    <div className="relative">
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar encabezado"
          onClick={() => edit.setSelectedId("__hero__")}
          className="right-4 top-4 z-30"
        />
      ) : null}
      <CivisHero
        title={hero.title}
        lede={hero.lede}
        subtitle={hero.subtitle}
        eyebrow={props.eyebrow}
        ctaHref={hero.ctaHref ?? props.ctaHref}
        ctaLabel={hero.ctaLabel ?? props.ctaLabel}
        images={images}
      />
    </div>
  );
}
