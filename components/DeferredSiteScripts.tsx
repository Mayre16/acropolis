"use client";

import dynamic from "next/dynamic";

const GoogleAnalytics = dynamic(
  () =>
    import("@/components/GoogleAnalytics").then((m) => ({
      default: m.GoogleAnalytics,
    })),
  { ssr: false },
);

const SiteAnalytics = dynamic(
  () =>
    import("@/components/SiteAnalytics").then((m) => ({
      default: m.SiteAnalytics,
    })),
  { ssr: false },
);

const CmsEditModeBootstrap = dynamic(
  () =>
    import("@/components/cms/CmsEditModeBootstrap").then((m) => ({
      default: m.CmsEditModeBootstrap,
    })),
  { ssr: false },
);

/** Analytics y bootstrap CMS fuera del JS crítico (móvil TBT). */
export function DeferredSiteScripts() {
  return (
    <>
      <GoogleAnalytics />
      <SiteAnalytics site="acropolis" />
      <CmsEditModeBootstrap />
    </>
  );
}
