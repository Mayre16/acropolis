"use client";

import { useQuienesSomosCmsEdit } from "@/components/cms/InstitutionalPageCmsEditContext";
import { mergeQuienesSomosPage } from "@/lib/cms/institutional-page-edit";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type { CmsQuienesSomosPage } from "@/lib/cms/types";

export function useQuienesSomosPageDisplay(): CmsQuienesSomosPage {
  const edit = useQuienesSomosCmsEdit();
  const cms = useCmsDocument();

  if (edit?.ready) return mergeQuienesSomosPage(edit.page);
  if (isCmsEnabled()) return mergeQuienesSomosPage(cms?.sections.quienesSomosPage);
  return mergeQuienesSomosPage(null);
}
