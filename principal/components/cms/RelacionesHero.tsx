"use client";

import { ArrowRight, HeartHandshake } from "lucide-react";
import { EsferaLogo } from "@/components/EsferaLogo";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useRelacionesCmsEdit } from "@/components/cms/InstitutionalPageCmsEditContext";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { mergeRelacionesPage } from "@/lib/cms/institutional-page-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { RELACIONES_HERO_IMAGES } from "@/lib/hero-images";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import {
  Globe2,
  HeartHandshake as HeartHandshakeIcon,
  Building2,
  Scale,
  Leaf,
  Users,
} from "lucide-react";

const FALLBACK = {
  eyebrow: "Institucional",
  title: "Relaciones institucionales",
  lede:
    "Nueva Acrópolis construye puentes sólidos de colaboración con otras instituciones para sus proyectos de voluntariado, cultura y acción social, humanitaria y medioambiental.",
};

const AREA_ICONS: Record<string, typeof Globe2> = {
  "medio-ambiente": Leaf,
  cultura: Globe2,
  etica: Scale,
  social: HeartHandshakeIcon,
  internacional: Building2,
  local: Users,
};

export function RelacionesHero() {
  const cms = useCmsDocument();
  const edit = useRelacionesCmsEdit();
  const images = useHeroCarouselImages("relaciones", RELACIONES_HERO_IMAGES);
  const published = mergeRelacionesPage(
    isCmsEnabled() ? cms?.sections.relacionesPage : undefined,
  );
  const draft = edit?.ready ? mergeRelacionesPage(edit.page) : published;
  const display = resolvePageHero(FALLBACK, published, draft, edit?.ready);

  return (
    <CmsPageHero
      id="relaciones-hero"
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[
        { label: "Inicio", href: "/" },
        { label: "Relaciones institucionales" },
      ]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedId("__hero__")}
    />
  );
}

export function RelacionesPageBody() {
  const cms = useCmsDocument();
  const edit = useRelacionesCmsEdit();
  const whatsapp = useWhatsAppUrls();
  const page = edit?.ready
    ? mergeRelacionesPage(edit.page)
    : mergeRelacionesPage(
        isCmsEnabled() ? cms?.sections.relacionesPage : undefined,
      );

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative">
          {edit?.ready ? (
            <div className="absolute -top-2 right-0">
              <CmsSectionEditBar
                label="Editar intro"
                onClick={() => edit.setSelectedId("__relIntro__")}
              />
            </div>
          ) : null}
          <p className="text-lg leading-relaxed text-na-muted">{page.intro}</p>
        </div>
      </section>

      <section className="border-t border-na-heket/10 bg-na-heket/[0.04] py-12 sm:py-14">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {edit?.ready ? (
            <div className="mb-4 flex justify-end">
              <CmsSectionEditBar
                label="Editar cifras"
                onClick={() => edit.setSelectedId("__stats__")}
              />
            </div>
          ) : null}
          <div className="grid gap-6 sm:grid-cols-3">
          {(page.stats ?? []).map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-na-heket/10 bg-na-surface p-7 text-center shadow-na-soft"
            >
              <p className="text-3xl font-black text-na-heket sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm font-medium text-na-muted">{s.label}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              {page.areasEyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {page.areasTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-na-muted">{page.areasIntro}</p>
          </div>
          {edit?.ready ? (
            <CmsSectionEditBar
              label="Editar textos"
              onClick={() => edit.setSelectedId("__areasSection__")}
            />
          ) : null}
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(page.areas ?? []).map(({ id, title, text }) => {
            const Icon = AREA_ICONS[id] ?? Globe2;
            return (
              <li
                key={id}
                className="relative rounded-2xl border border-na-heket/10 bg-na-surface p-6 shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
              >
                {edit?.ready ? (
                  <button
                    type="button"
                    onClick={() => edit.setSelectedId(`area:${id}`)}
                    className="absolute right-3 top-3 rounded-full bg-amber-500 p-2 text-white shadow"
                    aria-label={`Editar ${title}`}
                  >
                    ✎
                  </button>
                ) : null}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-na-heket/10 text-na-heket">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-black text-na-heketDark">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-na-muted">
                  {text}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-na-heket/10 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="relative">
              {edit?.ready ? (
                <div className="mb-4">
                  <CmsSectionEditBar
                    label="Editar bloque RD"
                    onClick={() => edit.setSelectedId("__rdSection__")}
                  />
                </div>
              ) : null}
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
                {page.rdEyebrow}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
                {page.rdTitle}
              </h2>
              <p className="mt-4 text-na-muted">{page.rdIntro}</p>
              <ul className="mt-6 space-y-3">
                {(page.rdItems ?? []).map((r) => {
                  const showEsferaLogo =
                    r.id === "rd2" || /esfera/i.test(r.text);
                  return (
                    <li key={r.id} className="flex gap-3 text-na-heketDark">
                      <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-na-kefer" />
                      <div className="min-w-0">
                        <span className="text-sm leading-relaxed">{r.text}</span>
                        {showEsferaLogo ? (
                          <div className="mt-3 max-w-[14rem]">
                            <EsferaLogo
                              variant="punto-focal"
                              tone="color"
                              className="!h-auto !w-full"
                            />
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="relative rounded-[1.5rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-10">
              {edit?.ready ? (
                <div className="absolute right-3 top-3">
                  <CmsSectionEditBar
                    label="Editar CTA"
                    onClick={() => edit.setSelectedId("__cta__")}
                  />
                </div>
              ) : null}
              <h3 className="text-balance text-xl font-black text-white sm:text-2xl">
                {page.ctaTitle}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-white/85">{page.ctaText}</p>
              <a
                href={`${whatsapp.cursos}?text=${encodeURIComponent(
                  "Hola, represento a una institución y me gustaría explorar una alianza con Nueva Acrópolis RD.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
              >
                Proponer una alianza
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
