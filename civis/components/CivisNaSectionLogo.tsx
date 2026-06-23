import {
  NaBrandLockupGroup,
  type NaBrandLockupSize,
} from "@/components/NaBrandLockupGroup";
import type { BrandLockupId } from "@/lib/brand-assets";

const CONFIG = {
  footer: {
    lockup: "oinadom" satisfies BrandLockupId,
    size: "civisFooterOinadom" satisfies NaBrandLockupSize,
    render: "raster" as const,
    maxWidthClass: "max-w-[min(92vw,11.5rem)]",
  },
  quienesSomos: {
    lockup: "oina" satisfies BrandLockupId,
    size: "quienesSomos" satisfies NaBrandLockupSize,
    render: "raster" as const,
    markHeightRem: 3.875,
  },
} as const;

type CivisNaSectionLogoProps = {
  /** footer → oinadom · quienesSomos → oina (raster aprobados, sin descriptor HTML). */
  context: keyof typeof CONFIG;
  variant?: "color" | "white";
  align?: "left" | "center";
};

/** Lockup NA en Civis — raster desde `Logos OINADOM/` (descriptor integrado en la imagen). */
export function CivisNaSectionLogo({
  context,
  variant = "color",
  align = "center",
}: CivisNaSectionLogoProps) {
  const config = CONFIG[context];

  return (
    <NaBrandLockupGroup
      lockup={config.lockup}
      size={config.size}
      variant={variant}
      align={align === "center" ? "center" : "start"}
      render={config.render}
      maxWidthClass={"maxWidthClass" in config ? config.maxWidthClass : undefined}
      markHeightRem={"markHeightRem" in config ? config.markHeightRem : undefined}
    />
  );
}
