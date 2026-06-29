"use client";

import { Suspense, type ReactNode } from "react";
import { AgendaCmsEditProvider } from "@/components/cms/AgendaCmsEditContext";

export function AgendaPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AgendaCmsEditProvider>{children}</AgendaCmsEditProvider>
    </Suspense>
  );
}
