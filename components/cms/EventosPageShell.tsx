"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { EventosCmsEditProvider } from "@/components/cms/EventosCmsEditContext";

export function EventosPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <EventosCmsEditProvider>
        <CmsPageMediaWrap pageId="eventos">{children}</CmsPageMediaWrap>
      </EventosCmsEditProvider>
    </Suspense>
  );
}

