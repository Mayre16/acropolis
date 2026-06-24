"use client";

import { PageHero } from "@/components/PageHero";
import { FILOSOFIA_HERO_IMAGES } from "@/lib/hero-images";
import type { BrandLockupId } from "@/lib/brand-assets";
import type { HeroImage } from "@/lib/hero-images";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import { Pencil } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  lede?: string;
  brandLockup?: BrandLockupId;
  images?: HeroImage[];
  imageObjectPosition?: string;
};

export function FilosofiaHeroCms({
  eyebrow,
  title,
  lede,
  brandLockup,
  images = FILOSOFIA_HERO_IMAGES,
  imageObjectPosition,
}: Props) {
  const cms = useCmsDocument();
  const edit = useFilosofiaCmsEdit();
  const carouselImages = useHeroCarouselImages("filosofia", images);

  const fp = cms?.sections.filosofiaPage;
  const resolved = {
    eyebrow: isCmsEnabled() && fp?.heroEyebrow ? fp.heroEyebrow : eyebrow,
    title: isCmsEnabled() && fp?.heroTitle ? fp.heroTitle : title,
    lede: isCmsEnabled() && fp?.heroLede ? fp.heroLede : lede,
  };

  const display = edit?.ready
    ? {
        eyebrow: edit.filosofiaPage.heroEyebrow ?? eyebrow,
        title: edit.filosofiaPage.heroTitle ?? title,
        lede: edit.filosofiaPage.heroLede ?? lede,
      }
    : resolved;

  return (
    <div id="filosofia-hero" className="relative scroll-mt-24">
      <PageHero
        eyebrow={display.eyebrow}
        brandLockup={brandLockup}
        title={display.title}
        lede={display.lede}
        crumbs={[{ label: "Inicio", href: "/" }, { label: "Filosofía" }]}
        images={carouselImages}
        imageObjectPosition={imageObjectPosition}
      />
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => {
            edit.setActiveSection("hero");
            edit.scrollToSection("filosofia-hero");
          }}
          className="absolute right-4 top-24 z-20 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg"
        >
          <Pencil className="h-4 w-4" />
          Editar encabezado
        </button>
      ) : null}
    </div>
  );
}
