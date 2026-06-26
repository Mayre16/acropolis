"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { HeroOinadomLogo } from "@/components/HeroOinadomLogo";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { HOME_HERO_BACKGROUND } from "@/lib/hero-images";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { assetUrl } from "@/lib/asset-url";
import {
  CMS_EDIT_HERO_PENDING_CLASS,
  CMS_EDIT_HERO_READY_CLASS,
  isInEditorIframe,
  parseCmsEditParam,
  readStoredCmsEditMode,
} from "@/lib/cms/edit-mode";

function isHomeCmsEditActive(): boolean {
  if (typeof window === "undefined") return false;
  const fromUrl = parseCmsEditParam(
    new URLSearchParams(window.location.search).get("cmsEdit"),
  );
  if (fromUrl === "1") return true;
  return isInEditorIframe() && readStoredCmsEditMode() === "1";
}

const HERO_OVERLAY = "bg-na-heket/[0.78]";
const HERO_CTA =
  "inline-flex items-center justify-center rounded-2xl border-2 border-white bg-na-heket/50 px-10 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-na-heket/65 sm:rounded-3xl sm:px-12 sm:py-[1.125rem] sm:text-sm";

export function HomeHeroCms() {
  const cmsEditMode = useCmsEditMode();
  const cms = useCmsDocument();
  const edit = useHomeCmsEdit();
  const published = cms?.sections.homeHero;
  const draft = edit?.homeHero;
  const [inHomeEdit, setInHomeEdit] = useState(false);

  useLayoutEffect(() => {
    setInHomeEdit(cmsEditMode === "1" || isHomeCmsEditActive());
  }, [cmsEditMode]);

  /** En el iframe nunca mostrar published/default hasta tener el borrador. */
  const awaitingDraft = inHomeEdit && !edit?.ready;

  const h1 =
    (edit?.ready ? draft?.h1 : isCmsEnabled() ? published?.h1 : undefined) ??
    "Nueva Acrópolis República Dominicana";

  let backgroundSrc: string | null = null;
  if (awaitingDraft) {
    backgroundSrc = null;
  } else if (inHomeEdit && edit?.ready) {
    const draftSrc = draft?.background?.src?.trim();
    backgroundSrc = draftSrc || HOME_HERO_BACKGROUND.src;
  } else {
    backgroundSrc =
      (
        (isCmsEnabled() ? published?.background?.src : undefined) ??
        HOME_HERO_BACKGROUND.src
      ).trim() || HOME_HERO_BACKGROUND.src;
  }

  const backgroundAlt =
    inHomeEdit && edit?.ready
      ? draft?.background?.alt ?? HOME_HERO_BACKGROUND.alt
      : (isCmsEnabled() ? published?.background?.alt : undefined) ??
        HOME_HERO_BACKGROUND.alt;
  const resolvedBackgroundSrc = backgroundSrc
    ? assetUrl(resolveCmsMediaUrl(backgroundSrc) ?? backgroundSrc)
    : null;

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!inHomeEdit) {
      root.classList.remove(CMS_EDIT_HERO_PENDING_CLASS, CMS_EDIT_HERO_READY_CLASS);
      return;
    }
    if (edit?.ready && resolvedBackgroundSrc) {
      root.classList.add(CMS_EDIT_HERO_READY_CLASS);
    } else {
      root.classList.remove(CMS_EDIT_HERO_READY_CLASS);
    }
  }, [inHomeEdit, edit?.ready, resolvedBackgroundSrc]);

  return (
    <section
      id="home-hero"
      className="relative flex min-h-screen items-center justify-center overflow-x-hidden scroll-mt-24"
    >
      <div className="absolute inset-0" data-hero-bg aria-hidden>
        {resolvedBackgroundSrc ? (
          <Image
            src={resolvedBackgroundSrc}
            alt={backgroundAlt}
            fill
            priority
            unoptimized
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-na-heket/15"
            aria-label="Cargando foto del encabezado…"
          />
        )}
      </div>
      <div
        className={`pointer-events-none absolute inset-0 ${HERO_OVERLAY}`}
        aria-hidden
      />

      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setSelected("hero", "__hero__")}
          className="absolute right-4 top-24 z-20 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg"
        >
          <Pencil className="h-4 w-4" />
          Editar encabezado
        </button>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-[700px] flex-col items-center overflow-visible px-5 pb-12 pt-[150px] text-center md:px-12 md:pb-[50px] md:pt-[100px]">
        <HeroOinadomLogo
          priority
          align="center"
          size="hero"
          maxWidthClass="max-w-[min(94vw,32rem)]"
        />
        <h1 className="sr-only">{h1}</h1>
        <Link
          href="/quienes-somos"
          className={`${HERO_CTA} pointer-events-auto mt-8 sm:mt-10`}
        >
          Qué es Nueva Acrópolis
        </Link>
      </div>
    </section>
  );
}
