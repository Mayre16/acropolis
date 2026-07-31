"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";

const HeroCarouselCmsEditProvider = dynamic(
  () =>
    import("@/components/cms/HeroCarouselCmsEditContext").then((m) => ({
      default: m.HeroCarouselCmsEditProvider,
    })),
  { ssr: false, loading: () => null },
);

const SiteFooterCmsEditProvider = dynamic(
  () =>
    import("@/components/cms/SiteFooterCmsEditContext").then((m) => ({
      default: m.SiteFooterCmsEditProvider,
    })),
  { ssr: false, loading: () => null },
);

const PlatformNavCmsEditProvider = dynamic(
  () =>
    import("@/components/cms/PlatformNavCmsEditContext").then((m) => ({
      default: m.PlatformNavCmsEditProvider,
    })),
  { ssr: false, loading: () => null },
);

/** En público no evalúa los editores de chrome (footer/nav/carrusel). */
export function CmsChromeEditGate({ children }: { children: ReactNode }) {
  const mode = useCmsEditMode();
  if (!mode) return <>{children}</>;
  return (
    <HeroCarouselCmsEditProvider>
      <SiteFooterCmsEditProvider>
        <PlatformNavCmsEditProvider>{children}</PlatformNavCmsEditProvider>
      </SiteFooterCmsEditProvider>
    </HeroCarouselCmsEditProvider>
  );
}
