"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { VenuesCmsEditProvider } from "@/components/cms/VenuesCmsEditContext";

export function VenuesPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <VenuesCmsEditProvider>
        <CmsPageMediaWrap pageId="donde-estamos">{children}</CmsPageMediaWrap>
      </VenuesCmsEditProvider>
    </Suspense>
  );
}
