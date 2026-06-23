import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { HeroCarousel } from "@/components/HeroCarousel";

import { EsferaLogo } from "@/components/EsferaLogo";

import type { BrandLockupId } from "@/lib/brand-assets";

import type { HeroImage } from "@/lib/hero-images";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Migas: [{label, href}] — el último sin href es la página actual. */
  crumbs?: { label: string; href?: string }[];
  /** Si se pasan, se muestran como carrusel de fondo detrás del degradado. */
  images?: HeroImage[];
  /** Lockup superior: Nueva Acrópolis (con subtítulo) o Esfera Punto Focal. */
  brandMark?: "na" | "esfera";
  /** Lockup de marca sobre el título (oina, oinadom, trilogo, escuela…). */
  brandLockup?: BrandLockupId;
  /** Encuadre del carrusel de fondo (object-position). */
  imageObjectPosition?: string;
  /** `background` = carrusel a pantalla completa; `split` = texto izquierda, carrusel pequeño derecha. */
  layout?: "background" | "split";
};

export function PageHero({
  eyebrow,
  title,
  lede,
  crumbs,
  images,
  brandMark = "na",
  brandLockup: _brandLockup,
  imageObjectPosition,
  layout = "background",
}: PageHeroProps) {
  const hasImages = !!images && images.length > 0;
  const isSplit = layout === "split" && hasImages;

  const brandMarkNode =
    brandMark === "esfera" ? (
      <div className="max-w-3xl -translate-y-2.5">
        <EsferaLogo
          variant="punto-focal"
          priority
          tone="white"
          className="h-auto w-auto max-h-[4.5rem] max-w-[21rem] sm:max-h-20 sm:max-w-[23rem] md:max-h-[5.5rem] md:max-w-[25rem]"
        />
      </div>
    ) : null;

  const crumbsNode =
    crumbs && crumbs.length > 0 ? (
      <nav
        aria-label="Migas de pan"
        className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/70"
      >
        {crumbs.map((c, i) => (
          <span key={c.label} className="inline-flex items-center gap-1">
            {c.href ? (
              <Link href={c.href} className="hover:text-white">
                {c.label}
              </Link>
            ) : (
              <span className="text-white/90">{c.label}</span>
            )}
            {i < crumbs.length - 1 ? (
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            ) : null}
          </span>
        ))}
      </nav>
    ) : (
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-na-helios">
        {eyebrow}
      </p>
    );

  const titleNode = (
    <h1 className="mt-3 max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl">
      {title}
    </h1>
  );

  const ledeNode = lede ? (
    <h2 className="mt-5 max-w-2xl text-balance text-lg font-normal leading-relaxed text-white/90 drop-shadow-sm">
      {lede}
    </h2>
  ) : null;

  if (isSplit) {
    return (
      <section className="relative overflow-hidden rounded-b-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,201,13,0.18),transparent_48%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_min(36%,20rem)] lg:gap-12">
            <div className="min-w-0">
              {brandMarkNode ? <div className="mb-4">{brandMarkNode}</div> : null}
              {crumbsNode}
              {titleNode}
              {ledeNode}
            </div>

            <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-2xl shadow-2xl shadow-na-heketDark/40 ring-1 ring-white/20 lg:mx-0 lg:max-w-none">
              <HeroCarousel
                images={images}
                priorityFirst
                objectPosition={imageObjectPosition ?? "50% 28%"}
                contained
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-heketDark/45 via-transparent to-na-heketDark/10"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-b-[1.75rem] ${
        hasImages
          ? "bg-na-heketDark"
          : "bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer"
      }`}
    >
      {hasImages ? (
        <>
          <HeroCarousel
            images={images}
            priorityFirst
            objectPosition={imageObjectPosition}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-na-heketDark/95 via-na-heket/88 to-na-kefer/82"
            aria-hidden
          />
        </>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,201,13,0.22),transparent_48%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {brandMarkNode ? <div className="mb-4">{brandMarkNode}</div> : null}
        {crumbsNode}
        {titleNode}
        {ledeNode}
      </div>
    </section>
  );
}
