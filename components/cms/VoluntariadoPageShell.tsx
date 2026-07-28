"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { VoluntariadoCmsEditProvider } from "@/components/cms/VoluntariadoCmsEditContext";

export function VoluntariadoPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <VoluntariadoCmsEditProvider>
        <CmsPageMediaWrap pageId="voluntariado">{children}</CmsPageMediaWrap>
      </VoluntariadoCmsEditProvider>
    </Suspense>
  );
}
