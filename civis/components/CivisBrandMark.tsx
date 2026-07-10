import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { HEADER_SUBMARCA_LOGO, SUBMARCA_LOGO } from "@/lib/site-config";

/** Proporción ancho/alto del identificador horizontal Civis. */
export const CIVIS_MARK_ASPECT = SUBMARCA_LOGO.width / SUBMARCA_LOGO.height;

/** Proporción del identificador recortado para header. */
export const CIVIS_HEADER_MARK_ASPECT =
  HEADER_SUBMARCA_LOGO.width / HEADER_SUBMARCA_LOGO.height;

type CivisBrandMarkProps = {
  className?: string;
  priority?: boolean;
  /** sm = compacto · md = footer · lg = header integrado */
  size?: "sm" | "md" | "lg";
};

const MD_HEIGHT_REM = 3;
const SM_HEIGHT_REM = 2.25;
const MD_WIDTH_REM = CIVIS_MARK_ASPECT * MD_HEIGHT_REM;
const SM_WIDTH_REM = CIVIS_MARK_ASPECT * SM_HEIGHT_REM;

const CIVIS_MARK_STYLE_MD = {
  height: `${MD_HEIGHT_REM}rem`,
  width: `${MD_WIDTH_REM}rem`,
  minHeight: `${MD_HEIGHT_REM}rem`,
  minWidth: `${MD_WIDTH_REM}rem`,
  maxHeight: `${MD_HEIGHT_REM}rem`,
  maxWidth: `${MD_WIDTH_REM}rem`,
} as const;

const CIVIS_MARK_STYLE_SM = {
  height: `${SM_HEIGHT_REM}rem`,
  width: `${SM_WIDTH_REM}rem`,
  minHeight: `${SM_HEIGHT_REM}rem`,
  minWidth: `${SM_WIDTH_REM}rem`,
  maxHeight: `${SM_HEIGHT_REM}rem`,
  maxWidth: `${SM_WIDTH_REM}rem`,
} as const;

/** Identificador horizontal Civis — dimensiones fijas en header y footer. */
export function CivisBrandMark({
  className,
  priority = false,
  size = "md",
}: CivisBrandMarkProps) {
  const sizeClass =
    size === "lg"
      ? "civis-brand-mark--lg"
      : size === "sm"
        ? "civis-brand-mark--sm"
        : "civis-brand-mark--md";

  const logo = size === "lg" ? HEADER_SUBMARCA_LOGO : SUBMARCA_LOGO;

  const inlineStyle =
    size === "lg"
      ? undefined
      : size === "sm"
        ? CIVIS_MARK_STYLE_SM
        : CIVIS_MARK_STYLE_MD;

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      unoptimized
      className={cn(
        "civis-brand-mark block shrink-0",
        size !== "lg" && "object-contain object-left",
        sizeClass,
        className,
      )}
      style={inlineStyle}
    />
  );
}
