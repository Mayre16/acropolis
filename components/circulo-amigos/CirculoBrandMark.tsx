import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import {
  CIRCULO_HEADER_SUBMARCA_LOGO,
  CIRCULO_SUBMARCA_LOGO,
} from "@/lib/circulo-amigos-content";

/** Proporción del identificador recortado (header, footer). */
export const CIRCULO_MARK_ASPECT =
  CIRCULO_HEADER_SUBMARCA_LOGO.width / CIRCULO_HEADER_SUBMARCA_LOGO.height;

/** @deprecated Alias de CIRCULO_MARK_ASPECT. */
export const CIRCULO_HEADER_MARK_ASPECT = CIRCULO_MARK_ASPECT;

type CirculoBrandMarkProps = {
  className?: string;
  priority?: boolean;
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

  const logo = CIRCULO_HEADER_SUBMARCA_LOGO;

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
                const fallback = CIRCULO_HEADER_SUBMARCA_LOGO.fallback;
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
