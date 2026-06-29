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
import {
  getHomeAgendaEntries,
  mergeAgendaEntriesIntoDoc,
  newAgendaId,
} from "@/lib/cms/agenda-edit";
import { appendEventoDraftsToDoc } from "@/lib/cms/content-edit";
import { promoteAgendaEntryLocally } from "@/lib/agenda-evento";
import { ALL_AGENDA_ENTRIES } from "@/lib/agenda-registry";
import type {
  CmsAgendaEntry,
  CmsAgendaPage,
  CmsDocument,
  CmsEvento,
} from "@/lib/cms/types";
import { AgendaEntryEditFields } from "@/components/cms/AgendaEntryEditFields";
import {
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
} from "@/components/cms/CmsEditFields";

type AgendaCmsEditContextValue = {
  ready: boolean;
  page: CmsAgendaPage;
  items: CmsAgendaEntry[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  setSelectedSlug: (slug: string | null) => void;
  patchPage: (patch: Partial<CmsAgendaPage>) => void;
  patchItem: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  addItem: () => void;
  deleteItem: (id: string) => void;
  promoteToEvento: (entry: CmsAgendaEntry) => void;
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

function buildDoc(
  base: CmsDocument,
  items: CmsAgendaEntry[],
  hidden: string[],
  page: CmsAgendaPage,
  eventoDrafts: CmsEvento[] = [],
): CmsDocument {
  const withAgenda = mergeAgendaEntriesIntoDoc(base, items, hidden);
  const withDrafts = appendEventoDraftsToDoc(withAgenda, eventoDrafts);
  return mergeHeroCarouselsIntoDoc({
    ...withDrafts,
    sections: { ...withDrafts.sections, agendaPage: page },
  });
}

function AgendaCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [page, setPage] = useState<CmsAgendaPage>({});
  const [items, setItems] = useState<CmsAgendaEntry[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [eventoDrafts, setEventoDrafts] = useState<CmsEvento[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    setItems(getHomeAgendaEntries(draft, ALL_AGENDA_ENTRIES));
    setHidden(draft.sections.agendaHidden ?? []);
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDoc(latest, items, hidden, page, eventoDrafts);
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
  }, [token, items, hidden, page, eventoDrafts]);

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

  const patchItem = useCallback(
    (id: string, patch: Partial<CmsAgendaEntry>) => {
      setItems((list) =>
        list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    const entry: CmsAgendaEntry = {
      id: newAgendaId(),
      category: "conferencia",
      title: "Nueva actividad",
      startsAt: new Date().toISOString().slice(0, 10),
      date: "",
      time: "",
      sede: "",
      tag: "",
      showOnHome: true,
      detailHref: "/agenda",
      detailLabel: "Ver agenda",
      description: "",
      inscribeMessage:
        "Hola, me interesa una actividad de Nueva Acrópolis. ¿Me pueden dar más información?",
    };
    setItems((list) => [...list, entry]);
    setSelectedId(entry.id);
    markDirty();
    requestAnimationFrame(() => {
      document
        .getElementById("agenda-listing")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [markDirty]);

  const deleteItem = useCallback(
    (id: string) => {
      setItems((list) => list.filter((e) => e.id !== id));
      setHidden((h) => (h.includes(id) ? h : [...h, id]));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const promoteToEvento = useCallback(
    (entry: CmsAgendaEntry) => {
      const existingSlugs = eventoDrafts.map((e) => e.slug);
      const { updatedEntry, draft } = promoteAgendaEntryLocally(
        entry,
        existingSlugs,
      );
      setItems((list) =>
        list.map((e) => (e.id === entry.id ? updatedEntry : e)),
      );
      setEventoDrafts((list) => [...list, draft]);
      markDirty();
      window.alert(
        `Borrador creado: /eventos/${draft.slug}. Edítalo y publícalo en Eventos.`,
      );
    },
    [eventoDrafts, markDirty],
  );

  const setSelectedSlug = useCallback((slug: string | null) => {
    setSelectedId(slug);
  }, []);

  const value = useMemo(
    (): AgendaCmsEditContextValue => ({
      ready,
      page,
      items,
      selectedId,
      setSelectedId,
      setSelectedSlug,
      patchPage,
      patchItem,
      addItem,
      deleteItem,
      promoteToEvento,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      page,
      items,
      selectedId,
      setSelectedSlug,
      patchPage,
      patchItem,
      addItem,
      deleteItem,
      promoteToEvento,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected =
    selectedId && !selectedId.startsWith("__")
      ? items.find((e) => e.id === selectedId)
      : undefined;

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
      {selectedId === "__hero__" ? (
        <EditPanelChrome
          title="Encabezado de la agenda"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields
            value={page}
            onChange={patchPage}
            carouselKey="agenda"
          />
        </EditPanelChrome>
      ) : null}
      {selected ? (
        <EditPanelChrome
          title="Editar actividad"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
            La <strong>categoría</strong> define dónde aparece la actividad
            (filtros de esta página, Cultura, Cursos, Voluntariado, etc.). El
            carrusel del home solo muestra actividades con fecha futura y «Mostrar
            en carrusel del home» activado.
          </p>
          <AgendaEntryEditFields
            entry={selected}
            token={token}
            onChange={(patch) => patchItem(selected.id, patch)}
            onDelete={() => deleteItem(selected.id)}
            onPromoteToEvento={promoteToEvento}
            showHomeToggle
            showCategorySelect
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
