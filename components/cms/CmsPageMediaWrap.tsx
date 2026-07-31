"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import type { CmsPageMediaTarget } from "@/lib/cms/types";

const PageMediaSections = dynamic(
  () =>
    import("@/components/cms/PageMediaSections").then((m) => ({
      default: m.PageMediaSections,
    })),
  { loading: () => null },
);

const PageMediaCmsProvider = dynamic(
  () =>
    import("@/components/cms/PageMediaCmsContext").then((m) => ({
      default: m.PageMediaCmsProvider,
    })),
  { ssr: false, loading: () => null },
);

export function CmsPageMediaWrap({
  pageId,
  children,
}: {
  pageId: CmsPageMediaTarget;
  children: ReactNode;
}) {
  const editing = useCmsEditMode();

  if (!editing) {
    return (
      <>
        {children}
        <PageMediaSections pageId={pageId} />
      </>
    );
  }

  return (
    <PageMediaCmsProvider pageId={pageId} siteId="acropolis">
      {children}
      <PageMediaSections pageId={pageId} />
    </PageMediaCmsProvider>
  );
}
