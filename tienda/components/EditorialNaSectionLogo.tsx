import {
  NaBrandLockupGroup,
  type NaBrandLockupSize,
} from "@/components/NaBrandLockupGroup";
import type { BrandLockupId } from "@/lib/brand-assets";

const CONFIG = {
  footer: {
    lockup: "oinadom" satisfies BrandLockupId,
    size: "footerOinadom" satisfies NaBrandLockupSize,
    render: "raster" as const,
    maxWidthClass: "max-w-[min(92vw,13.375rem)]",
  },
  section: {
    lockup: "na" satisfies BrandLockupId,
    size: "quienesSomos" satisfies NaBrandLockupSize,
    render: "raster" as const,
    maxWidthClass: "max-w-[min(92vw,10.5rem)]",
  },
  content: {
    lockup: "na" satisfies BrandLockupId,
    size: "quienesSomos" satisfies NaBrandLockupSize,
    render: "raster" as const,
    maxWidthClass: "max-w-[min(92vw,10.5rem)]",
  },
} as const;

type EditorialNaSectionLogoProps = {
  /** footer → oinadom con país · section/content → na verde sin descriptor. */
  size?: keyof typeof CONFIG;
  variant?: "color" | "white";
  align?: "left" | "center";
};

/** Lockup NA en Editorial — raster aprobado (descriptor integrado en la imagen). */
export function EditorialNaSectionLogo({
  size = "section",
  variant = "color",
  align = "center",
}: EditorialNaSectionLogoProps) {
  const config = CONFIG[size];

  return (
    <NaBrandLockupGroup
      lockup={config.lockup}
      size={config.size}
      variant={variant}
      align={align === "center" ? "center" : "start"}
      render={config.render}
      maxWidthClass={config.maxWidthClass}
    />
  );
}
