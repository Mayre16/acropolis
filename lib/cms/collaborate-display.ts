"use client";

import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import {
  COLLABORATE_SECTION_ID,
  collaborateTabSelectedId,
  mergeCollaborateBlock,
} from "@/lib/cms/collaborate-content";
import type { CmsCollaborateBlock } from "@/lib/cms/types";

export function useCollaborateDisplay() {
  const cms = useCmsDocument();
  const esferaEdit = useEsferaCmsEdit();
  const volEdit = useVoluntariadoCmsEdit();

  const overrides: CmsCollaborateBlock | undefined = esferaEdit?.ready
    ? esferaEdit.collaborate
    : volEdit?.ready
      ? volEdit.collaborate
      : isCmsEnabled()
        ? cms?.sections.collaborateBlock
        : undefined;

  return mergeCollaborateBlock(overrides);
}

export function useCollaborateCmsEdit() {
  const esfera = useEsferaCmsEdit();
  if (esfera?.ready) {
    return {
      ready: true as const,
      setSelectedId: esfera.setSelectedId,
    };
  }
  const vol = useVoluntariadoCmsEdit();
  if (vol?.ready) {
    return {
      ready: true as const,
      setSelectedId: vol.setSelectedId,
    };
  }
  return null;
}

export { COLLABORATE_SECTION_ID, collaborateTabSelectedId };
