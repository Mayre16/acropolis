"use client";

import type { ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { HomeCmsEditProvider } from "@/components/cms/HomeCmsEditContext";
import { CursosCmsEditProvider } from "@/components/cms/CursosCmsEditContext";

export function HomePageShell({ children }: { children: ReactNode }) {
  return (
    <HomeCmsEditProvider>
      <CursosCmsEditProvider embedded>
        <CmsPageMediaWrap pageId="home">{children}</CmsPageMediaWrap>
      </CursosCmsEditProvider>
    </HomeCmsEditProvider>
  );
}
