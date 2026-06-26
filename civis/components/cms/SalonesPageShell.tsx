"use client";

import { Suspense, type ReactNode } from "react";
import { SalonesCmsEditProvider } from "@/components/cms/SalonesCmsEditContext";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";

/** Activa el CMS de salones solo en `/salones` (modo `?cmsEdit=1`). */
export function SalonesPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SalonesCmsEditProvider>
        <CmsPageMediaWrap pageId="salones">{children}</CmsPageMediaWrap>
      </SalonesCmsEditProvider>
    </Suspense>
  );
}
