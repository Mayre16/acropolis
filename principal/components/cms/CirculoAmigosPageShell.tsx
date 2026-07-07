"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { CirculoAmigosCmsEditProvider } from "@/components/cms/CirculoAmigosCmsEditContext";

export function CirculoAmigosPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CirculoAmigosCmsEditProvider>
        <CmsPageMediaWrap pageId="circulo-amigos">{children}</CmsPageMediaWrap>
      </CirculoAmigosCmsEditProvider>
    </Suspense>
  );
}
