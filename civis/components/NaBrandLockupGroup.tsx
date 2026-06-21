import { cn } from "@/lib/utils/cn";

import type { BrandLockupId, BrandLogoVariant } from "@/lib/brand-assets";

import { brandLogoHeightClass } from "@/lib/brand-clear-space";

import { BrandLogo } from "@/components/BrandLogo";



/** Presets de escala — sincronizado con `principal/components/NaBrandLockupGroup.tsx`. */

export const NA_BRAND_LOCKUP_SIZES = {

  headerFilial: brandLogoHeightClass.headerFilial,

  hero: brandLogoHeightClass.hero,

  footer: brandLogoHeightClass.footer,
  civisFooterOinadom: brandLogoHeightClass.civisFooterOinadom,
  footerSubmarca: brandLogoHeightClass.footerSubmarca,
  footerInstitutional: brandLogoHeightClass.footerInstitutional,

  sectionStacked: brandLogoHeightClass.sectionStacked,

  quienesSomos: brandLogoHeightClass.quienesSomos,

  contenidoHub: brandLogoHeightClass.contenidoHub,

  contentDigital: brandLogoHeightClass.contentDigital,

  internationalBand: brandLogoHeightClass.internationalBand,

  pageHero: brandLogoHeightClass.pageHero,

  pageHeroTrilogo: brandLogoHeightClass.pageHeroTrilogo,

  diplomadoHero: brandLogoHeightClass.diplomadoHero,

} as const;



export type NaBrandLockupSize = keyof typeof NA_BRAND_LOCKUP_SIZES;



type NaBrandLockupGroupProps = {

  lockup: BrandLockupId;

  size?: NaBrandLockupSize;

  variant?: BrandLogoVariant;

  align?: "start" | "center";

  descriptorProminence?: "default" | "hero";

  /** Civis: descriptor SVG al ancho del wordmark. */
  fitDescriptorToWordmark?: boolean;

  className?: string;

  maxWidthClass?: string;

  priority?: boolean;

  render?: "auto" | "hybrid" | "raster";

};



/** Lockup NA agrupado — anagrama + nombre + descriptor como una sola pieza escalable. */

export function NaBrandLockupGroup({

  lockup,

  size = "sectionStacked",

  variant = "color",

  align = "center",

  descriptorProminence = "default",

  fitDescriptorToWordmark,

  className,

  maxWidthClass,

  priority,

  render,

}: NaBrandLockupGroupProps) {

  return (

    <BrandLogo

      lockup={lockup}

      variant={variant}

      align={align}

      descriptorProminence={descriptorProminence}

      fitDescriptorToWordmark={fitDescriptorToWordmark}

      priority={priority}

      render={render}

      className={cn(NA_BRAND_LOCKUP_SIZES[size], className)}

      maxWidthClass={maxWidthClass}

    />

  );

}

