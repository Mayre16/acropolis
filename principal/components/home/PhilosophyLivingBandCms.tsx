"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Pencil } from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { DEFAULT_HOME_PAGE, mergeHomePage } from "@/lib/cms/home-page-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { assetUrl } from "@/lib/asset-url";

export function PhilosophyLivingBandCms() {
  const cms = useCmsDocument();
  const edit = useHomeCmsEdit();
  const page = edit?.ready
    ? mergeHomePage({ ...DEFAULT_HOME_PAGE, ...edit.homePage })
    : mergeHomePage(isCmsEnabled() ? cms?.sections.homePage : undefined);
  const band = page.philosophyBand ?? DEFAULT_HOME_PAGE.philosophyBand!;
  const bgSrc = assetUrl(
    resolveCmsMediaUrl(band.imageSrc) ??
      band.imageSrc ??
      "/img/home/filosofia-para-vivir.webp",
  );

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[20rem] sm:min-h-[24rem] md:min-h-[28rem]">
        {edit?.ready ? (
          <button
            type="button"
            onClick={() => edit.setSelected("philosophyBand", "philosophyBand")}
            className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar banda
          </button>
        ) : null}
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block md:bg-fixed"
          style={{ backgroundImage: `url(${bgSrc})` }}
          aria-hidden
        />
        <Image
          src={bgSrc}
          alt=""
          fill
          className="object-cover object-center md:hidden"
          unoptimized
          aria-hidden
          priority={false}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-na-heket/80"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-16 md:py-20">
          <p className="text-balance text-2xl font-black italic text-na-amon sm:text-3xl">
            {band.headline}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-white/90 sm:text-sm">
            {band.eyebrow}
          </p>
          <p className="mt-3 max-w-xl text-balance text-sm text-white/85 sm:text-base">
            {band.text}
          </p>
          <Link
            href="/filosofia"
            className="mt-7 inline-flex items-center gap-2 border border-white/70 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 sm:text-sm"
          >
            {band.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
