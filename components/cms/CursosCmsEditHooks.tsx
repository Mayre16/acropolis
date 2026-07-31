"use client";

import { createContext, useContext } from "react";
import type {
  CmsAgendaEntry,
  CmsCirculoAmigosPromo,
  CmsCursosCard,
  CmsCursosPage,
  CmsSalon,
  CmsSalonesPage,
} from "@/lib/cms/types";
import type { SalonSede } from "@/lib/salones";
import type { AddSalonOptions } from "@/lib/cms/salones-edit";

export type CursosCmsEditContextValue = {
  ready: boolean;
  page: CmsCursosPage;
  agendaItems: CmsAgendaEntry[];
  salonesItems: CmsSalon[];
  salonesPage: CmsSalonesPage;
  circuloAmigos: CmsCirculoAmigosPromo;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchPage: (patch: Partial<CmsCursosPage>) => void;
  patchAgendaItem: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  addAgendaItem: () => void;
  deleteAgendaItem: (id: string) => void;
  patchOfertaCard: (
    kind: "cursos" | "conf",
    id: string,
    patch: Partial<CmsCursosCard>,
  ) => void;
  addOfertaCard: (kind: "cursos" | "conf") => void;
  deleteOfertaCard: (kind: "cursos" | "conf", id: string) => void;
  patchSalon: (id: string, patch: Partial<CmsSalon>) => void;
  addSalon: (options?: AddSalonOptions) => void;
  hideSalon: (id: string) => void;
  restoreSalon: (id: string) => void;
  hideSalonSede: (sede: SalonSede) => void;
  restoreSalonSede: (sede: SalonSede) => void;
  salonesSedesHidden: string[];
  salonesHidden: string[];
  patchSalonesPage: (patch: Partial<CmsSalonesPage>) => void;
  patchCirculoAmigos: (patch: Partial<CmsCirculoAmigosPromo>) => void;
  getOfertaCards: (kind: "cursos" | "conf") => CmsCursosCard[];
  getHiddenOfertaCards: (kind: "cursos" | "conf") => CmsCursosCard[];
  isOfertaCardHidden: (kind: "cursos" | "conf", id: string) => boolean;
  restoreOfertaCard: (kind: "cursos" | "conf", id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

export const CursosCmsEditContext =
  createContext<CursosCmsEditContextValue | null>(null);

/** En público siempre null — no carga el editor de cursos/salones. */
export function useCursosCmsEdit() {
  return useContext(CursosCmsEditContext);
}
