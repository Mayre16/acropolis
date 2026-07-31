"use client";

import { createContext, useContext } from "react";
import { pageMediaForPage } from "@/lib/cms/page-media";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type {
  CmsPageMediaBlock,
  CmsPageMediaBlockKind,
  CmsPageMediaCard,
  CmsPageMediaSection,
  CmsPageMediaTarget,
} from "@/lib/cms/types";

export type PageMediaCmsEditContextValue = {
  ready: boolean;
  pageId: CmsPageMediaTarget;
  sections: CmsPageMediaSection[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchSection: (id: string, patch: Partial<CmsPageMediaSection>) => void;
  patchBlock: (
    sectionId: string,
    blockId: string,
    patch: Partial<CmsPageMediaBlock>,
  ) => void;
  insertBlockAt: (
    sectionId: string,
    index: number,
    kind: CmsPageMediaBlockKind,
  ) => string;
  moveBlockUp: (sectionId: string, blockId: string) => void;
  moveBlockDown: (sectionId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, activeId: string, overId: string) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  addGalleryItem: (sectionId: string, blockId: string) => string;
  patchGalleryItem: (
    sectionId: string,
    blockId: string,
    itemId: string,
    patch: Partial<CmsPageMediaCard>,
  ) => void;
  deleteGalleryItem: (
    sectionId: string,
    blockId: string,
    itemId: string,
  ) => void;
  moveGalleryItemUp: (
    sectionId: string,
    blockId: string,
    itemId: string,
  ) => void;
  moveGalleryItemDown: (
    sectionId: string,
    blockId: string,
    itemId: string,
  ) => void;
  addSection: () => string;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  insertSectionAt: (index: number) => string;
  deleteSection: (id: string) => void;
  saveDraft: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

export const PageMediaCmsEditContext =
  createContext<PageMediaCmsEditContextValue | null>(null);

export function usePageMediaCmsEdit() {
  return useContext(PageMediaCmsEditContext);
}

export function usePageMediaDisplay(pageId: CmsPageMediaTarget) {
  const edit = usePageMediaCmsEdit();
  const cms = useCmsDocument();
  if (edit?.ready && edit.pageId === pageId) return edit.sections;
  if (isCmsEnabled()) {
    return pageMediaForPage(cms?.sections.pageMediaSections, pageId);
  }
  return [];
}
