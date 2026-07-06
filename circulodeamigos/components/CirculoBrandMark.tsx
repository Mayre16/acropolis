import { cn } from "@/lib/utils/cn";
import { HEADER_SUBMARCA_LOGO, SUBMARCA_LOGO } from "@/lib/site-config";

export const CIRCULO_MARK_ASPECT =
  SUBMARCA_LOGO.width / SUBMARCA_LOGO.height;

export const CIRCULO_HEADER_MARK_ASPECT =
  HEADER_SUBMARCA_LOGO.width / HEADER_SUBMARCA_LOGO.height;

type CirculoBrandMarkProps = {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
};

/** Placeholder de identificador — sustituir por PNG/WebP cuando esté el logo oficial. */
export function CirculoBrandMark({
  className,
  size = "md",
}: CirculoBrandMarkProps) {
  const sizeClass =
    size === "lg"
      ? "circulo-brand-mark--lg"
      : size === "sm"
        ? "circulo-brand-mark--sm"
        : "circulo-brand-mark--md";

  return (
    <div
      className={cn(
        "circulo-brand-mark flex h-full w-full flex-col justify-center bg-white px-4 text-[var(--circulo-header-brand,#5bb5e8)]",
        sizeClass,
        className,
      )}
      aria-label={SUBMARCA_LOGO.alt}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--circulo-header-brand,#5bb5e8)] sm:text-[11px]">
        Círculo de Amigos
      </span>
      <span className="text-sm font-black leading-tight text-[#2e8bc7] sm:text-base">
        OINADOM
      </span>
      <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:block">
        Logo oficial — pendiente
      </span>
    </div>
  );
}
