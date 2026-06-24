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
import { VOLUNTARIADO_PROXIMAS_ACTIVIDADES } from "@/lib/voluntariado-agenda";
import { DEFAULT_VOLUNTARIADO_PAGE } from "@/lib/voluntariado-content";
import {
  mergeVoluntariadoPage,
  voluntariadoRecienteId,
} from "@/lib/cms/voluntariado-display";
import { VoluntariadoExtraCmsPanels } from "@/components/cms/VoluntariadoExtraCmsPanels";
import {
  getVoluntariadoEntries,
  mergeVoluntariadoIntoDoc,
  newVoluntariadoId,
} from "@/lib/cms/agenda-edit";
import {
  fetchCmsDraft,
  publishCms,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import { CollaborateCmsPanels } from "@/components/cms/CollaborateCmsPanels";
import {
  DEFAULT_COLLABORATE_BLOCK,
  mergeCollaborateBlock,
} from "@/lib/cms/collaborate-content";
import type {
  CmsAgendaEntry,
  CmsCollaborateBlock,
  CmsCollaborateTab,
  CmsDocument,
  CmsVoluntariadoCard,
  CmsVoluntariadoInfoCard,
  CmsVoluntariadoPage,
  CmsVoluntariadoReciente,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryEditFields } from "@/components/cms/AgendaEntryEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";

const DEFAULT_PAGE = DEFAULT_VOLUNTARIADO_PAGE;

type VoluntariadoCmsEditContextValue = {
  ready: boolean;
  items: CmsAgendaEntry[];
  page: CmsVoluntariadoPage;
  collaborate: CmsCollaborateBlock;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchItem: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  patchPage: (patch: Partial<CmsVoluntariadoPage>) => void;
  patchQueHacemosCard: (id: string, patch: Partial<CmsVoluntariadoCard>) => void;
  patchSostenibilidadCard: (
    id: string,
    patch: Partial<CmsVoluntariadoInfoCard>,
  ) => void;
  patchReciente: (id: string, patch: Partial<CmsVoluntariadoReciente>) => void;
  addReciente: () => void;
  deleteReciente: (id: string) => void;
  patchCollaborate: (patch: Partial<CmsCollaborateBlock>) => void;
  patchCollaborateTab: (id: string, patch: Partial<CmsCollaborateTab>) => void;
  addItem: () => void;
  deleteItem: (id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const VoluntariadoCmsEditContext =
  createContext<VoluntariadoCmsEditContextValue | null>(null);

export function useVoluntariadoCmsEdit() {
  return useContext(VoluntariadoCmsEditContext);
}

function buildDoc(
  base: CmsDocument,
  items: CmsAgendaEntry[],
  page: CmsVoluntariadoPage,
  collaborate: CmsCollaborateBlock,
): CmsDocument {
  const withAgenda = mergeVoluntariadoIntoDoc(base, items);
  return mergeHeroCarouselsIntoDoc({
    ...withAgenda,
    sections: {
      ...withAgenda.sections,
      voluntariadoPage: page,
      collaborateBlock: collaborate,
    },
  });
}

function VoluntariadoCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<CmsAgendaEntry[]>([]);
  const [page, setPage] = useState<CmsVoluntariadoPage>(DEFAULT_PAGE);
  const [collaborate, setCollaborate] = useState<CmsCollaborateBlock>(
    DEFAULT_COLLABORATE_BLOCK,
  );
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
    setItems(getVoluntariadoEntries(draft, VOLUNTARIADO_PROXIMAS_ACTIVIDADES));
    setPage(mergeVoluntariadoPage(draft.sections.voluntariadoPage));
    setCollaborate(mergeCollaborateBlock(draft.sections.collaborateBlock));
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDoc(latest, items, page, collaborate);
      await saveCmsDraft("acropolis", token, next);
      setDirty(false);
      setStatus("Borrador guardado.");
      postToEditor({ type: "cms-status", text: "Borrador guardado.", ok: true });
      postToEditor({ type: "cms-dirty", dirty: false });
    } catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, items, page, collaborate]);

  const publish = useCallback(async () => {
    if (!token) return;
    if (!window.confirm("¿Publicar estos cambios?")) return;
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDoc(latest, items, page, collaborate);
      await saveCmsDraft("acropolis", token, next);
      const publishResult = await publishCms("acropolis", token);
      setDirty(false);
      setStatus(publishResult.message ?? "Publicado.");
} catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, items, page, collaborate]);

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

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cms-save") void saveDraft();
      if (msg.type === "cms-publish") void publish();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [saveDraft, publish]);

  const patchItem = useCallback(
    (id: string, patch: Partial<CmsAgendaEntry>) => {
      setItems((list) =>
        list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      markDirty();
    },
    [markDirty],
  );

  const patchPage = useCallback(
    (patch: Partial<CmsVoluntariadoPage>) => {
      setPage((p) => mergeVoluntariadoPage({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchQueHacemosCard = useCallback(
    (id: string, patch: Partial<CmsVoluntariadoCard>) => {
      setPage((p) => {
        const merged = mergeVoluntariadoPage(p);
        return {
          ...merged,
          queHacemosCards: (merged.queHacemosCards ?? []).map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchSostenibilidadCard = useCallback(
    (id: string, patch: Partial<CmsVoluntariadoInfoCard>) => {
      setPage((p) => {
        const merged = mergeVoluntariadoPage(p);
        return {
          ...merged,
          sostenibilidadCards: (merged.sostenibilidadCards ?? []).map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchReciente = useCallback(
    (id: string, patch: Partial<CmsVoluntariadoReciente>) => {
      setPage((p) => {
        const merged = mergeVoluntariadoPage(p);
        return {
          ...merged,
          recientesItems: (merged.recientesItems ?? []).map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addReciente = useCallback(() => {
    const item: CmsVoluntariadoReciente = {
      id: `vol-rec-${Date.now()}`,
      src: "",
      alt: "",
      title: "Nueva actividad reciente",
      date: "",
      text: "",
      href: "",
    };
    setPage((p) => {
      const merged = mergeVoluntariadoPage(p);
      return {
        ...merged,
        recientesItems: [...(merged.recientesItems ?? []), item],
      };
    });
    setSelectedId(voluntariadoRecienteId(item.id));
    markDirty();
  }, [markDirty]);

  const deleteReciente = useCallback(
    (id: string) => {
      setPage((p) => {
        const merged = mergeVoluntariadoPage(p);
        return {
          ...merged,
          recientesItems: (merged.recientesItems ?? []).filter((c) => c.id !== id),
        };
      });
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const patchCollaborate = useCallback(
    (patch: Partial<CmsCollaborateBlock>) => {
      setCollaborate((b) => mergeCollaborateBlock({ ...b, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchCollaborateTab = useCallback(
    (id: string, patch: Partial<CmsCollaborateTab>) => {
      setCollaborate((b) => {
        const merged = mergeCollaborateBlock(b);
        return {
          ...merged,
          tabs: (merged.tabs ?? []).map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    const entry: CmsAgendaEntry = {
      id: newVoluntariadoId(),
      category: "voluntariado",
      title: "Nueva actividad de voluntariado",
      startsAt: new Date().toISOString().slice(0, 10),
      date: "",
      time: "",
      sede: "",
      showOnHome: false,
      inscribeMessage:
        "Hola, me interesa una actividad de voluntariado de Nueva Acrópolis. ¿Me pueden dar más información?",
    };
    setItems((list) => [...list, entry]);
    setSelectedId(entry.id);
    markDirty();
  }, [markDirty]);

  const deleteItem = useCallback(
    (id: string) => {
      setItems((list) => list.filter((e) => e.id !== id));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): VoluntariadoCmsEditContextValue => ({
      ready,
      items,
      page,
      collaborate,
      selectedId,
      setSelectedId,
      patchItem,
      patchPage,
      patchQueHacemosCard,
      patchSostenibilidadCard,
      patchReciente,
      addReciente,
      deleteReciente,
      patchCollaborate,
      patchCollaborateTab,
      addItem,
      deleteItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      items,
      page,
      collaborate,
      selectedId,
      patchItem,
      patchPage,
      patchQueHacemosCard,
      patchSostenibilidadCard,
      patchReciente,
      addReciente,
      deleteReciente,
      patchCollaborate,
      patchCollaborateTab,
      addItem,
      deleteItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected = items.find((e) => e.id === selectedId);

  return (
    <VoluntariadoCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Voluntariado — contenido editable"
        dirty={dirty}
        busy={busy}
        status={status}
        onSave={() => void saveDraft()}
        onPublish={() => void publish()}
      />
      {!ready ? (
        <div className="bg-amber-50 py-3 text-center text-sm text-na-muted">
          Conectando con el editor…
        </div>
      ) : null}
      {children}
      {selected ? (
        <EditPanelChrome
          title="Editar actividad de voluntariado"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <AgendaEntryEditFields
            entry={selected}
            token={token}
            onChange={(patch) => patchItem(selected.id, patch)}
            onDelete={() => {
              if (window.confirm("¿Eliminar esta actividad?")) {
                deleteItem(selected.id);
              }
            }}
            showHomeToggle={false}
          />
        </EditPanelChrome>
      ) : null}
      {selectedId === "__section__" ? (
        <EditPanelChrome
          title="Textos de la sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={page.proximasTitle ?? ""}
              onChange={(v) => patchPage({ proximasTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.proximasIntro ?? ""}
              onChange={(v) => patchPage({ proximasIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedId === "__hero__" ? (
        <EditPanelChrome
          title="Encabezado de la página"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields
            value={page}
            onChange={patchPage}
            carouselKey="voluntariado"
          />
        </EditPanelChrome>
      ) : null}

      <CollaborateCmsPanels
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        collaborate={collaborate}
        patchCollaborate={patchCollaborate}
        patchTab={patchCollaborateTab}
        dirty={dirty}
        busy={busy}
        status={status}
        onSave={() => void saveDraft()}
      />

      <VoluntariadoExtraCmsPanels
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        page={page}
        patchPage={patchPage}
        patchQueHacemosCard={patchQueHacemosCard}
        patchSostenibilidadCard={patchSostenibilidadCard}
        patchReciente={patchReciente}
        deleteReciente={deleteReciente}
        token={token}
        dirty={dirty}
        busy={busy}
        status={status}
        onSave={() => void saveDraft()}
      />
    </VoluntariadoCmsEditContext.Provider>
  );
}

export function VoluntariadoCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <VoluntariadoCmsEditInner>{children}</VoluntariadoCmsEditInner>;
}
