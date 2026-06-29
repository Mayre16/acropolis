"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { fetchCmsDraft, saveCmsDraft } from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type { CmsAgendaPage, CmsDocument } from "@/lib/cms/types";
import {
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
} from "@/components/cms/CmsEditFields";

type AgendaCmsEditContextValue = {
  ready: boolean;
  page: CmsAgendaPage;
  selectedSlug: string | null;
  setSelectedSlug: (slug: string | null) => void;
  patchPage: (patch: Partial<CmsAgendaPage>) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const AgendaCmsEditContext = createContext<AgendaCmsEditContextValue | null>(
  null,
);

export function useAgendaCmsEdit() {
  return useContext(AgendaCmsEditContext);
}

function AgendaCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [page, setPage] = useState<CmsAgendaPage>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const ready = !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setDoc(draft);
    setPage(draft.sections.agendaPage ?? {});
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const getBuiltDoc = useCallback(() => {
    if (!doc) return null;
    return mergeHeroCarouselsIntoDoc({
      ...doc,
      sections: { ...doc.sections, agendaPage: page },
    });
  }, [doc, page]);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    const next = getBuiltDoc();
    if (!next) return;
    try {
      await saveCmsDraft("acropolis", token, next);
      setDoc(next);
      setDirty(false);
      setStatus("Borrador guardado.");
      postToEditor({ type: "cms-status", text: "Borrador guardado.", ok: true });
      postToEditor({ type: "cms-dirty", dirty: false });
    } catch (e) {
      const text = String(e);
      setStatus(text);
      postToEditor({ type: "cms-status", text, ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, getBuiltDoc]);

  const publish = useCallback(async () => {
    await runCoordinatedCmsPublish();
  }, []);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      setToken(initToken);
      fetchCmsDraft("acropolis")
        .then((draft) => {
          applyLoadedDoc(draft);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "acropolis");
  }, [applyLoadedDoc]);

  useCmsEditBridge(saveDraft);

  const patchPage = useCallback(
    (patch: Partial<CmsAgendaPage>) => {
      setPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): AgendaCmsEditContextValue => ({
      ready,
      page,
      selectedSlug,
      setSelectedSlug,
      patchPage,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      page,
      selectedSlug,
      patchPage,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  return (
    <AgendaCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Agenda"
        dirty={dirty}
        busy={busy}
        status={status}
        onSave={() => void saveDraft()}
        onPublish={() => void publish()}
      />
      {children}
      {selectedSlug === "__hero__" ? (
        <EditPanelChrome
          title="Encabezado de la agenda"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedSlug(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields
            value={page}
            onChange={patchPage}
            carouselKey="agenda"
          />
        </EditPanelChrome>
      ) : null}
    </AgendaCmsEditContext.Provider>
  );
}

export function AgendaCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <AgendaCmsEditInner>{children}</AgendaCmsEditInner>;
}
