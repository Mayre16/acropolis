"use client";

import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { CULTURA_CIRCULO_AMIGOS_DEFAULTS } from "@/lib/cultura-content";
import type { CmsCirculoAmigosPromo } from "@/lib/cms/types";

export function mergeCirculoAmigos(
  overrides?: CmsCirculoAmigosPromo | null,
): CmsCirculoAmigosPromo {
  return { ...CULTURA_CIRCULO_AMIGOS_DEFAULTS, ...overrides };
}

export function useCirculoAmigosDisplay() {
  const cms = useCmsDocument();
  const culturaEdit = useCulturaCmsEdit();
  const cursosEdit = useCursosCmsEdit();
  const homeEdit = useHomeCmsEdit();

  const overrides = culturaEdit?.ready
    ? culturaEdit.culturaPage?.circuloAmigos
    : cursosEdit?.ready
      ? cursosEdit.circuloAmigos
      : homeEdit?.ready
        ? homeEdit.circuloAmigos
        : isCmsEnabled()
          ? cms?.sections.culturaPage?.circuloAmigos
          : undefined;

  const promo = mergeCirculoAmigos(overrides);

  return {
    eyebrow: promo.eyebrow ?? CULTURA_CIRCULO_AMIGOS_DEFAULTS.eyebrow!,
    title: promo.title ?? CULTURA_CIRCULO_AMIGOS_DEFAULTS.title!,
    lede: promo.lede ?? CULTURA_CIRCULO_AMIGOS_DEFAULTS.lede!,
    imageSrc:
      resolveCmsMediaUrl(promo.imageSrc) ??
      promo.imageSrc ??
      CULTURA_CIRCULO_AMIGOS_DEFAULTS.imageSrc!,
    imageAlt: promo.imageAlt ?? CULTURA_CIRCULO_AMIGOS_DEFAULTS.imageAlt!,
  };
}

/** @deprecated Use useCirculoAmigosDisplay */
export const useCulturaCirculoAmigosDisplay = useCirculoAmigosDisplay;

export function useCirculoAmigosCmsEdit() {
  const cultura = useCulturaCmsEdit();
  if (cultura?.ready) {
    return {
      ready: true as const,
      setSelectedId: cultura.setSelectedId,
    };
  }
  const cursos = useCursosCmsEdit();
  if (cursos?.ready) {
    return {
      ready: true as const,
      setSelectedId: cursos.setSelectedId,
    };
  }
  const home = useHomeCmsEdit();
  if (home?.ready) {
    return {
      ready: true as const,
      setSelectedId: (id: string | null) =>
        home.setSelected("circuloAmigos", id),
    };
  }
  return null;
}

export const CIRCULO_AMIGOS_SELECTED_ID = "__circulo-amigos__";
