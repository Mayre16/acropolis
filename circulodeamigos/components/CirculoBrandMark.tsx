import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { HEADER_SUBMARCA_LOGO, SUBMARCA_LOGO } from "@/lib/site-config";

/** Proporción ancho/alto del identificador recortado (header y footer). */
export const CIRCULO_MARK_ASPECT =
  HEADER_SUBMARCA_LOGO.width / HEADER_SUBMARCA_LOGO.height;

/** @deprecated Alias de CIRCULO_MARK_ASPECT. */
export const CIRCULO_HEADER_MARK_ASPECT = CIRCULO_MARK_ASPECT;

type CirculoBrandMarkProps = {
  className?: string;
  priority?: boolean;
  /** sm = compacto · md = footer · lg = header integrado */
  size?: "sm" | "md" | "lg";
};

const MD_HEIGHT_REM = 3.25;
const SM_HEIGHT_REM = 2.35;
const MD_WIDTH_REM = CIRCULO_MARK_ASPECT * MD_HEIGHT_REM;
const SM_WIDTH_REM = CIRCULO_MARK_ASPECT * SM_HEIGHT_REM;

const CIRCULO_MARK_STYLE_MD = {
  height: `${MD_HEIGHT_REM}rem`,
  width: `${MD_WIDTH_REM}rem`,
  minHeight: `${MD_HEIGHT_REM}rem`,
  minWidth: `${MD_WIDTH_REM}rem`,
  maxHeight: `${MD_HEIGHT_REM}rem`,
  maxWidth: `${MD_WIDTH_REM}rem`,
} as const;

const CIRCULO_MARK_STYLE_SM = {
  height: `${SM_HEIGHT_REM}rem`,
  width: `${SM_WIDTH_REM}rem`,
  minHeight: `${SM_HEIGHT_REM}rem`,
  minWidth: `${SM_WIDTH_REM}rem`,
  maxHeight: `${SM_HEIGHT_REM}rem`,
  maxWidth: `${SM_WIDTH_REM}rem`,
} as const;

/** Identificador horizontal Círculo de Amigos — header y footer. */
export function CirculoBrandMark({
  className,
  priority = false,
  size = "md",
}: CirculoBrandMarkProps) {
  const sizeClass =
    size === "lg"
      ? "circulo-brand-mark--lg"
      : size === "sm"
        ? "circulo-brand-mark--sm"
        : "circulo-brand-mark--md";

  const logo = HEADER_SUBMARCA_LOGO;

  const inlineStyle =
    size === "lg"
      ? undefined
      : size === "sm"
        ? CIRCULO_MARK_STYLE_SM
        : CIRCULO_MARK_STYLE_MD;

  return (
    <span className="block h-full w-full">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority={priority}
        unoptimized
        className={cn(
          "circulo-brand-mark block shrink-0",
          size === "lg" && "h-full w-full",
          size !== "lg" && "object-contain object-left",
          sizeClass,
          className,
        )}
        style={inlineStyle}
        onError={
          size === "lg"
            ? (e) => {
                const img = e.currentTarget as HTMLImageElement;
                const fallback =
                  "fallback" in HEADER_SUBMARCA_LOGO
                    ? HEADER_SUBMARCA_LOGO.fallback
                    : "/img/circulo-amigos/logo-header-cropped.png";
                if (!img.src.includes(fallback.split("/").pop()!)) {
                  img.src = fallback;
                }
              }
            : undefined
        }
      />
    </span>
  );
}
