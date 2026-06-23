"use client";

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
  color: "/brand/logo-esfera-punto-focal.webp",
  white: "/brand/logo-esfera-punto-focal-white.webp",
  alt: "Esfera Punto Focal",
  width: 752,
  height: 320,
} as const;

function resolveLogoSrc(path: string): string {
  const cms = resolveCmsMediaUrl(path) ?? path;
  if (cms.startsWith("http://") || cms.startsWith("https://")) return cms;
  return assetUrl(cms);
}

/** Logo Esfera — `<img>` nativo (SVG fiable en GitHub Pages; evita Next/Image). */
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
          width: 320,
          height: 72,
        };

  const src = resolveLogoSrc(tone === "white" ? logo.white : logo.color);
  const useWhiteFilter =
    tone === "white" &&
    !logo.white.includes("-white") &&
    !logo.white.endsWith(".webp");

  const image = (
    <img
      src={src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(
        "block w-auto max-w-full",
        variant === "punto-focal" ? "h-auto" : "h-11 sm:h-12",
        useWhiteFilter && "brightness-0 invert",
        className,
      )}
      style={{ width: "auto", maxWidth: "100%", height: "auto" }}
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
