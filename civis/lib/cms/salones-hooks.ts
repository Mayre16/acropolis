"use client";

import { useCallback, useEffect, useState } from "react";
import { useSalonesCmsEdit } from "@/components/cms/SalonesCmsEditContext";
import { useCmsHydrated } from "@/lib/cms/hydration";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import {
  cmsToSalon,
  mergeSalones,
  resolveCivisSalonesPage,
} from "@/lib/cms/salones-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { SALONES, SALON_SEDES, type Salon } from "@/lib/salones";
import type { CmsCivisSalonesPage, CmsDocument } from "@/lib/cms/types";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");

export function useAcropolisSalonesCms(): CmsDocument | null {
  const [doc, setDoc] = useState<CmsDocument | null>(null);

  const load = useCallback(() => {
    if (!CMS_URL) return;
    fetch(`${CMS_URL}/content/acropolis/published`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CmsDocument | null) => {
        if (data?.version === 1) setDoc(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      if (ev.data?.type === "cms-published") load();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [load]);

  return doc;
}

export function useMergedSalones(): Salon[] {
  const edit = useSalonesCmsEdit();
  const acropolis = useAcropolisSalonesCms();
  const hydrated = useCmsHydrated();

  if (!hydrated) return SALONES;

  if (edit?.ready) {
    return edit.items.map(cmsToSalon);
  }

  if (!isCmsEnabled()) return SALONES;
  return mergeSalones(acropolis, SALONES);
}

export function useMergedSalonesBySede() {
  const salones = useMergedSalones();
  return SALON_SEDES.map((sede) => ({
    sede,
    salones: salones.filter((s) => s.sede === sede),
  })).filter((group) => group.salones.length > 0);
}

export function useCivisSalonesPage(): CmsCivisSalonesPage {
  const edit = useSalonesCmsEdit();
  const cms = useCmsDocument();
  const hydrated = useCmsHydrated();

  if (!hydrated) return resolveCivisSalonesPage(null);

  if (edit?.ready) return edit.page;

  if (!isCmsEnabled()) return resolveCivisSalonesPage(null);
  return resolveCivisSalonesPage(cms);
}
