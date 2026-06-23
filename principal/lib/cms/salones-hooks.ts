"use client";

import { mergeSalones, resolveSalonesPage } from "@/lib/cms/salones-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import {
  SALONES,
  SALONES_BY_SEDE,
  SALON_SEDES,
  type Salon,
} from "@/lib/salones";
import type { CmsSalonesPage } from "@/lib/cms/types";

export function useMergedSalones(): Salon[] {
  const cms = useCmsDocument();
  if (!isCmsEnabled()) return SALONES;
  return mergeSalones(cms, SALONES);
}

export function useMergedSalonesBySede() {
  const salones = useMergedSalones();
  return SALON_SEDES.map((sede) => ({
    sede,
    salones: salones.filter((s) => s.sede === sede),
  })).filter((group) => group.salones.length > 0);
}

export function useCmsSalonesPage(): CmsSalonesPage {
  const cms = useCmsDocument();
  if (!isCmsEnabled()) {
    return resolveSalonesPage(null);
  }
  return resolveSalonesPage(cms);
}

/** Fallback estático cuando no hay CMS. */
export { SALONES_BY_SEDE };
