"use client";

import { createContext, useContext } from "react";
import type {
  CmsHeroCarouselItem,
  CmsHeroCarouselKey,
  CmsHeroCarousels,
} from "@/lib/cms/hero-carousel-edit";

export type HeroCarouselCmsEditContextValue = {
  ready: boolean;
  token: string | null;
  carousels: CmsHeroCarousels;
  selectedKey: CmsHeroCarouselKey | null;
  selectedSlideId: string | null;
  openCarousel: (key: CmsHeroCarouselKey) => void;
  openSlide: (key: CmsHeroCarouselKey, slideId: string) => void;
  closePanel: () => void;
  patchSlide: (
    key: CmsHeroCarouselKey,
    slideId: string,
    patch: Partial<CmsHeroCarouselItem>,
  ) => void;
  addSlide: (key: CmsHeroCarouselKey) => void;
  removeSlide: (key: CmsHeroCarouselKey, slideId: string) => void;
  markDirty: () => void;
};

export const HeroCarouselCmsEditContext =
  createContext<HeroCarouselCmsEditContextValue | null>(null);

export function useHeroCarouselCmsEdit() {
  return useContext(HeroCarouselCmsEditContext);
}
