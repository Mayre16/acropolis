"use client";

import { createContext, useContext } from "react";
import type {
  CmsActivityPhoto,
  CmsAgendaEntry,
  CmsCirculoAmigosPromo,
  CmsEsferaHomePromo,
  CmsEsferaPage,
  CmsFraseDelDia,
  CmsHomePage,
  CmsHomePillar,
} from "@/lib/cms/types";

export type HomeSelectedKind =
  | "carousel"
  | "photo"
  | "frase"
  | "hero"
  | "whatIsNa"
  | "pillar"
  | "philosophyBand"
  | "circuloAmigos"
  | "esferaHome"
  | null;

export type EsferaHomeLogoFields = Pick<
  CmsEsferaPage,
  "esferaLogoSrc" | "esferaLogoWhiteSrc" | "esferaLogoAlt"
>;

export type HomeCmsEditContextValue = {
  ready: boolean;
  carousel: CmsAgendaEntry[];
  photos: CmsActivityPhoto[];
  frases: CmsFraseDelDia[];
  homePage: CmsHomePage;
  circuloAmigos: CmsCirculoAmigosPromo;
  esferaHomePromo: CmsEsferaHomePromo;
  esferaLogo: EsferaHomeLogoFields;
  homeHero: {
    h1?: string;
    h2?: string;
    lede?: string;
    background?: { src: string; alt: string };
  };
  selectedKind: HomeSelectedKind;
  selectedId: string | null;
  setSelected: (kind: HomeSelectedKind, id: string | null) => void;
  patchCarousel: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  patchPhoto: (index: number, patch: Partial<CmsActivityPhoto>) => void;
  patchFrase: (id: string, patch: Partial<CmsFraseDelDia>) => void;
  patchHomePage: (patch: Partial<CmsHomePage>) => void;
  patchPillar: (id: string, patch: Partial<CmsHomePillar>) => void;
  patchCirculoAmigos: (patch: Partial<CmsCirculoAmigosPromo>) => void;
  patchEsferaHomePromo: (patch: Partial<CmsEsferaHomePromo>) => void;
  patchEsferaLogo: (patch: Partial<EsferaHomeLogoFields>) => void;
  patchHomeHero: (patch: {
    h1?: string;
    h2?: string;
    lede?: string;
    background?: { src: string; alt: string };
  }) => void;
  addCarousel: () => void;
  addPhoto: () => void;
  addFrase: () => void;
  addFrasesFromFiles: (files: FileList | File[]) => Promise<void>;
  deletePhoto: (index: number) => void;
  deleteFrase: (id: string) => void;
  moveFrase: (id: string, dir: -1 | 1) => void;
  deleteCarousel: (id: string) => void;
  promoteCarouselToEvento: (entry: CmsAgendaEntry) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

export const HomeCmsEditContext =
  createContext<HomeCmsEditContextValue | null>(null);

/** En público siempre null — no carga el editor de home. */
export function useHomeCmsEdit() {
  return useContext(HomeCmsEditContext);
}
