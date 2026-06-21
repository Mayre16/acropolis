"use client";

import SiteImage from "@/components/SiteImage";
import { cn } from "@/lib/utils/cn";
import { assetUrl } from "@/lib/asset-url";
import { useEsferaBrandLogo } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

type EsferaLogoProps = {
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
  bare?: boolean;
  /** `red-global` = lockup oficial (default); `punto-focal` = variante RD. */
  variant?: "red-global" | "punto-focal";
  /** Blanco sobre mapa u otros fondos oscuros. */
  tone?: "color" | "white";
};

const PUNTO_FOCAL_LOGO = {
  color: "/brand/logo-esfera-punto-focal.svg",
  white: "/brand/logo-esfera-punto-focal.svg",
  alt: "Esfera Punto Focal",
  width: 300,
  height: 72,
} as const;

function resolveLogoSrc(path: string): string {
  const cms = resolveCmsMediaUrl(path) ?? path;
  if (cms.startsWith("http://") || cms.startsWith("https://")) return cms;
  return assetUrl(cms);
}

/** Logo Esfera — lee la imagen del CMS cuando está publicada. */
export function EsferaLogo({
  className,
  wrapperClassName,
  priority = false,
  bare = true,
  variant = "red-global",
  tone = "color",
}: EsferaLogoProps) {
  const brand = useEsferaBrandLogo();
  const logo =
    variant === "punto-focal"
      ? PUNTO_FOCAL_LOGO
      : {
          color: resolveCmsMediaUrl(brand.color) ?? brand.color,
          white: resolveCmsMediaUrl(brand.white) ?? brand.white,
          alt: brand.alt,
          width: 247,
          height: 116,
        };

  const src = resolveLogoSrc(tone === "white" ? logo.white : logo.color);
  const useWhiteFilter =
    tone === "white" && !logo.white.includes("-white");

  const image = (
    <SiteImage
      src={src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      unoptimized
      className={cn(
        "block h-11 w-auto sm:h-12",
        useWhiteFilter && "brightness-0 invert",
        className,
      )}
      style={{ width: "auto", maxWidth: "none" }}
    />
  );

  if (bare) {
    return image;
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-white/95 px-4 py-2.5 shadow-md ring-1 ring-white/20",
        wrapperClassName,
      )}
    >
      {image}
    </div>
  );
}
