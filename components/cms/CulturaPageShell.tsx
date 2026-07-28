"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { CulturaCmsEditProvider } from "@/components/cms/CulturaCmsEditContext";

export function CulturaPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CulturaCmsEditProvider>
        <CmsPageMediaWrap pageId="cultura">{children}</CmsPageMediaWrap>
      </CulturaCmsEditProvider>
    </Suspense>
  );
}
