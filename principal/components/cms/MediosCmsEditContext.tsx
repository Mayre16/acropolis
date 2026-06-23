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
import { MEDIOS, type MedioKind } from "@/lib/medios";
import {
  buildDocWithMedios,
  getMediosForEdit,
} from "@/lib/cms/content-edit";
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
import type { CmsDocument, CmsMedioItem } from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  ImageField,
} from "@/components/cms/CmsEditFields";

const MEDIO_KINDS: MedioKind[] = [
  "Entrevista",
  "Artículo",
  "Charla",
  "Programa",
  "Video",
];

type MediosCmsEditContextValue = {
  ready: boolean;
  items: CmsMedioItem[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchItem: (id: string, patch: Partial<CmsMedioItem>) => void;
  addItem: () => void;
  hideItem: (id: string) => void;
  scrollToSection: () => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const MediosCmsEditContext = createContext<MediosCmsEditContextValue | null>(
  null,
);

export function useMediosCmsEdit() {
  return useContext(MediosCmsEditContext);
}

function MediosCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsMedioItem[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
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
    const { items: loaded, hidden: h } = getMediosForEdit(draft, MEDIOS);
    setItems(loaded);
    setHidden(h);
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const getBuiltDoc = useCallback(
    (base: CmsDocument) => buildDocWithMedios(base, items, hidden),
    [items, hidden],
  );

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = getBuiltDoc(latest);
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
    if (!token) return;
    if (
      !window.confirm(
        "¿Publicar? Los visitantes verán estos cambios. Se guarda un respaldo automático.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = getBuiltDoc(latest);
      await saveCmsDraft("acropolis", token, next);
      const publishResult = await publishCms("acropolis", token);
      setDoc(next);
      setDirty(false);
      setStatus(publishResult.message ?? "Publicado.");
} catch (e) {
      const text = String(e);
      setStatus(text);
      postToEditor({ type: "cms-status", text, ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, getBuiltDoc]);

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
    (id: string, patch: Partial<CmsMedioItem>) => {
      setItems((list) =>
        list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    const id = `medio-${Date.now().toString(36)}`;
    const entry: CmsMedioItem = {
      id,
      title: "Nueva aparición en medios",
      outlet: "",
      kind: "Entrevista",
      people: "",
      date: "",
      excerpt: "",
      url: "",
      image: { src: "", alt: "" },
    };
    setItems((list) => [...list, entry]);
    setSelectedId(id);
    markDirty();
    requestAnimationFrame(() => {
      document
        .getElementById("voz-fuera-sede")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [markDirty]);

  const hideItem = useCallback(
    (id: string) => {
      setItems((list) => list.filter((m) => m.id !== id));
      setHidden((h) => (h.includes(id) ? h : [...h, id]));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const scrollToSection = useCallback(() => {
    document
      .getElementById("voz-fuera-sede")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    (): MediosCmsEditContextValue => ({
      ready,
      items,
      selectedId,
      setSelectedId,
      patchItem,
      addItem,
      hideItem,
      scrollToSection,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      items,
      selectedId,
      patchItem,
      addItem,
      hideItem,
      scrollToSection,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected = items.find((m) => m.id === selectedId);
  const editMode = useCmsEditMode();
  const showToolbar = editMode === "medios";

  return (
    <MediosCmsEditContext.Provider value={value}>
      {showToolbar ? (
        <EditToolbar
          label="Voz fuera de la sede"
          dirty={dirty}
          busy={busy}
          status={status}
          onSave={() => void saveDraft()}
          onPublish={() => void publish()}
        />
      ) : null}
      {!ready && showToolbar ? (
        <div className="bg-amber-50 py-3 text-center text-sm text-na-muted">
          Conectando con el editor…
        </div>
      ) : null}
      {children}
      {selected ? (
        <EditPanelChrome
          title="Editar aparición en medios"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
              Se publica en <strong>Nuestra voz fuera de la sede</strong> con
              enlace al medio externo. No crea una página propia en el sitio.
            </p>
            <EditField
              label="Título"
              value={selected.title}
              onChange={(v) => patchItem(selected.id, { title: v })}
            />
            <EditField
              label="Enlace (URL del medio)"
              value={selected.url}
              onChange={(v) => patchItem(selected.id, { url: v })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Medio / outlet"
                value={selected.outlet}
                onChange={(v) => patchItem(selected.id, { outlet: v })}
              />
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Tipo</span>
                <select
                  value={selected.kind}
                  onChange={(e) =>
                    patchItem(selected.id, {
                      kind: e.target.value as MedioKind,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  {MEDIO_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <EditField
              label="Personas"
              value={selected.people}
              onChange={(v) => patchItem(selected.id, { people: v })}
            />
            <EditField
              label="Fecha (opcional)"
              value={selected.date ?? ""}
              onChange={(v) => patchItem(selected.id, { date: v })}
            />
            <EditField
              label="Descripción breve"
              value={selected.excerpt}
              onChange={(v) => patchItem(selected.id, { excerpt: v })}
              multiline
            />
            <ImageField
              label="Foto (opcional)"
              media={selected.image ?? { src: "", alt: "" }}
              token={token}
              onChange={(image) => patchItem(selected.id, { image })}
            />
            {selected.url ? (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm font-semibold text-na-kefer hover:underline"
              >
                Probar enlace ↗
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar esta aparición del sitio?")) {
                  hideItem(selected.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}
    </MediosCmsEditContext.Provider>
  );
}

export function MediosCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1" && editMode !== "medios") return <>{children}</>;
  return <MediosCmsEditInner>{children}</MediosCmsEditInner>;
}

