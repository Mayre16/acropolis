import Image from "next/image";
import { ConstellationSky } from "@/components/diplomado/ConstellationSky";
import { DIPLOMADO_HERO } from "@/lib/diplomado-content";
import { cn } from "@/lib/utils/cn";

type HeroVariant = "mobile" | "desktop";

function ConstellationHeroCanvas({ variant }: { variant: HeroVariant }) {
  const assets = DIPLOMADO_HERO[variant];
  const isDesktop = variant === "desktop";

  return (
    <div
      id="diplomado-hero"
      className={cn(
        "constellation-hero relative overflow-hidden bg-[#021a18]",
        isDesktop
          ? "constellation-hero--desktop aspect-[4/3] w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          : "constellation-hero--mobile -mx-4 aspect-[99/100] w-[calc(100%+2rem)]",
      )}
    >
      <Image
        src={assets.sky}
        alt=""
        fill
        className="constellation-hero__sky-bg object-cover"
        style={{ objectPosition: assets.skyObjectPosition }}
        sizes={isDesktop ? "(min-width: 1024px) 520px, 100vw" : "430px"}
        priority
        unoptimized
      />
      <div
        className="constellation-hero__sky-depth pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />

      <div className="constellation-hero__stage pointer-events-none absolute inset-0">
        <div className="constellation-hero__slot constellation-hero__slot--pyramids relative">
          <Image
            src={assets.pyramids}
            alt=""
            fill
            className="diplomado-hero-figure object-contain object-bottom"
            sizes={isDesktop ? "320px" : "240px"}
            priority
            unoptimized
          />
        </div>

        <div className="constellation-hero__slot constellation-hero__slot--buddha relative">
          <Image
            src={assets.buddha}
            alt=""
            fill
            className="diplomado-hero-figure object-contain object-left-bottom"
            sizes={isDesktop ? "240px" : "170px"}
            priority
            unoptimized
          />
        </div>

        <div className="constellation-hero__slot constellation-hero__slot--philosopher relative">
          <Image
            src={assets.philosopher}
            alt=""
            fill
            className="diplomado-hero-figure object-contain object-right-bottom"
            sizes={isDesktop ? "240px" : "170px"}
            priority
            unoptimized
          />
        </div>
      </div>

      <ConstellationSky />
    </div>
  );
}

/** Collage animado del hero — variantes móvil (Framer) y web (escritorio). */
export function ConstellationHero() {
  return (
    <>
      <div className="lg:hidden">
        <ConstellationHeroCanvas variant="mobile" />
      </div>
      <div className="hidden lg:block">
        <ConstellationHeroCanvas variant="desktop" />
      </div>
    </>
  );
}
