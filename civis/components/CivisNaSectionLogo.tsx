import {
  NaBrandLockupGroup,
  type NaBrandLockupSize,
} from "@/components/NaBrandLockupGroup";
import type { BrandLockupId } from "@/lib/brand-assets";

const CONFIG = {
  footer: {
    lockup: "oinadom" satisfies BrandLockupId,
    size: "civisFooterOinadom" satisfies NaBrandLockupSize,
    maxWidthClass: "max-w-[min(92vw,11.5rem)]",
  },
  quienesSomos: {
    lockup: "oina" satisfies BrandLockupId,
    size: "quienesSomos" satisfies NaBrandLockupSize,
    maxWidthClass: "max-w-[min(92vw,8.5rem)]",
  },
} as const;

type CivisNaSectionLogoProps = {
  /** footer → oinadom · quienesSomos → oina */
  context: keyof typeof CONFIG;
  variant?: "color" | "white";
  align?: "left" | "center";
};

/** Lockup NA en Civis — descriptor ajustado al ancho del wordmark. */
export function CivisNaSectionLogo({
  context,
  variant = "color",
  align = "center",
}: CivisNaSectionLogoProps) {
  const { lockup, size, maxWidthClass } = CONFIG[context];

  return (
    <NaBrandLockupGroup
      lockup={lockup}
      size={size}
      variant={variant}
      align={align === "center" ? "center" : "start"}
      fitDescriptorToWordmark
      className={align === "center" ? "mx-auto block w-fit" : undefined}
      maxWidthClass={maxWidthClass}
    />
  );
}
