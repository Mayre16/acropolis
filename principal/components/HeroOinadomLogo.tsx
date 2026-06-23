import { BrandLogo } from "@/components/BrandLogo";
import { brandLogoHeightClass } from "@/lib/brand-clear-space";
import { cn } from "@/lib/utils/cn";

type HeroOinadomSize = keyof typeof brandLogoHeightClass;

type HeroOinadomLogoProps = {
  align?: "start" | "center";
  priority?: boolean;
  size?: HeroOinadomSize;
  maxWidthClass?: string;
  className?: string;
};

/** Lockup oinadom blanco oficial (raster completo del kit) — heroes de Acrópolis. */
export function HeroOinadomLogo({
  align = "start",
  priority,
  size = "pageHero",
  maxWidthClass = "max-w-[min(92vw,22rem)]",
  className,
}: HeroOinadomLogoProps) {
  return (
    <div className={cn("overflow-visible pb-1", className)}>
      <BrandLogo
        lockup="oinadom"
        variant="white"
        render="raster"
        align={align}
        priority={priority}
        className={brandLogoHeightClass[size]}
        maxWidthClass={maxWidthClass}
      />
    </div>
  );
}
