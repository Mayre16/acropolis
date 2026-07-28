"use client";

import { Suspense, type ReactNode } from "react";
import { ArticulosCmsEditProvider } from "@/components/cms/ArticulosCmsEditContext";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { MediosCmsEditProvider } from "@/components/cms/MediosCmsEditContext";

export function ArticulosPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <MediosCmsEditProvider>
        <ArticulosCmsEditProvider>
          <CmsPageMediaWrap pageId="articulos">{children}</CmsPageMediaWrap>
        </ArticulosCmsEditProvider>
      </MediosCmsEditProvider>
    </Suspense>
  );
}
