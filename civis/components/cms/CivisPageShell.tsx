"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import type { CmsPageMediaTarget } from "@/lib/cms/types";

export function CivisPageShell({
  pageId,
  children,
}: {
  pageId: CmsPageMediaTarget;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <CmsPageMediaWrap pageId={pageId}>{children}</CmsPageMediaWrap>
    </Suspense>
  );
}
