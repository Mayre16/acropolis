"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { isInEditorIframe, readStoredCmsEditMode } from "@/lib/cms/edit-mode";

const HomeCmsEditProvider = dynamic(
  () =>
    import("@/components/cms/HomeCmsEditContext").then((m) => ({
      default: m.HomeCmsEditProvider,
    })),
  { ssr: false, loading: () => null },
);

const CursosCmsEditProvider = dynamic(
  () =>
    import("@/components/cms/CursosCmsEditContext").then((m) => ({
      default: m.CursosCmsEditProvider,
    })),
  { ssr: false, loading: () => null },
);

function useHomeEditActive() {
  const editMode = useCmsEditMode();
  if (editMode === "1") return true;
  if (typeof window === "undefined") return false;
  return isInEditorIframe() && readStoredCmsEditMode() === "1";
}

export function HomePageShell({ children }: { children: ReactNode }) {
  const editing = useHomeEditActive();

  if (!editing) {
    return <CmsPageMediaWrap pageId="home">{children}</CmsPageMediaWrap>;
  }

  return (
    <HomeCmsEditProvider>
      <CursosCmsEditProvider embedded>
        <CmsPageMediaWrap pageId="home">{children}</CmsPageMediaWrap>
      </CursosCmsEditProvider>
    </HomeCmsEditProvider>
  );
}
