"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { CursosCmsEditProvider } from "@/components/cms/CursosCmsEditContext";
import { SalonesCmsEditProvider } from "@/components/cms/SalonesCmsEditContext";

export function CursosPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CursosCmsEditProvider>
        <SalonesCmsEditProvider>
          <CmsPageMediaWrap pageId="cursos">{children}</CmsPageMediaWrap>
        </SalonesCmsEditProvider>
      </CursosCmsEditProvider>
    </Suspense>
  );
}
