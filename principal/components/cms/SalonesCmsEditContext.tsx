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
import { usePathname } from "next/navigation";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { SALONES } from "@/lib/salones";
import {
  buildDocWithSalones,
  getSalonesForEdit,
  DEFAULT_SALONES_PAGE,
} from "@/lib/cms/salones-edit";
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
import type { CmsDocument, CmsSalon, CmsSalonesPage } from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  ImageField,
} from "@/components/cms/CmsEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";

const LAYOUT_OPTIONS = [
  { value: "butacas", label: "Butacas en filas" },
  { value: "mesas", label: "Mesas tipo escuela" },
  { value: "herradura", label: "Disposición herradura" },
] as const;

type SalonesCmsEditContextValue = {
  ready: boolean;
  items: CmsSalon[];
  page: CmsSalonesPage;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchItem: (id: string, patch: Partial<CmsSalon>) => void;
  patchPage: (patch: Partial<CmsSalonesPage>) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const SalonesCmsEditContext = createContext<SalonesCmsEditContextValue | null>(
  null,
);

export function useSalonesCmsEdit() {
  const cursos = useCursosCmsEdit();
  if (cursos?.ready) {
    return {
      ready: cursos.ready,
      items: cursos.salonesItems,
      page: cursos.salonesPage,
      selectedId: cursos.selectedId,
      setSelectedId: cursos.setSelectedId,
      patchItem: cursos.patchSalon,
      patchPage: cursos.patchSalonesPage,
      saveDraft: cursos.saveDraft,
      publish: cursos.publish,
      dirty: cursos.dirty,
      busy: cursos.busy,
      token: cursos.token,
    } satisfies SalonesCmsEditContextValue;
  }
  return useContext(SalonesCmsEditContext);
}

function SalonesCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsSalon[]>([]);
  const [page, setPage] = useState<CmsSalonesPage>(DEFAULT_SALONES_PAGE);
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
    setItems(getSalonesForEdit(draft, SALONES));
    setPage({ ...DEFAULT_SALONES_PAGE, ...draft.sections.salonesPage });
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = mergeHeroCarouselsIntoDoc(
        buildDocWithSalones(latest, items, page),
      );
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
  }, [token, items, page]);

  const publish = useCallback(async () => {
    if (!token) return;
    if (
      !window.confirm(
        "¿Publicar? Los visitantes verán estos cambios en Acrópolis y Civis.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = mergeHeroCarouselsIntoDoc(
        buildDocWithSalones(latest, items, page),
      );
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
  }, [token, items, page]);

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
    (id: string, patch: Partial<CmsSalon>) => {
      setItems((list) =>
        list.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
      markDirty();
    },
    [markDirty],
  );

  const patchPage = useCallback(
    (patch: Partial<CmsSalonesPage>) => {
      setPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const selected = items.find((s) => s.id === selectedId) ?? null;

  const value = useMemo(
    (): SalonesCmsEditContextValue => ({
      ready,
      items,
      page,
      selectedId,
      setSelectedId,
      patchItem,
      patchPage,
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
      selectedId,
      patchItem,
      patchPage,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  return (
    <SalonesCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Salones en alquiler"
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
              label="Etiqueta superior"
              value={page.eyebrow ?? ""}
              onChange={(v) => patchPage({ eyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.title ?? ""}
              onChange={(v) => patchPage({ title: v })}
            />
            <EditField
              label="Introducción"
              value={page.intro ?? ""}
              onChange={(v) => patchPage({ intro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selected ? (
        <EditPanelChrome
          title={`Editar salón — ${selected.name}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Nombre"
              value={selected.name}
              onChange={(v) => patchItem(selected.id, { name: v })}
            />
            <EditField
              label="Resumen"
              value={selected.summary}
              onChange={(v) => patchItem(selected.id, { summary: v })}
              multiline
            />
            <label className="block text-sm">
              <span className="font-semibold text-slate-700">
                Disposición en la foto
              </span>
              <select
                value={selected.featuredLayout}
                onChange={(e) =>
                  patchItem(selected.id, {
                    featuredLayout: e.target
                      .value as CmsSalon["featuredLayout"],
                  })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {LAYOUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <EditField
                label="Cap. butacas"
                value={String(selected.capacities.butacas)}
                onChange={(v) =>
                  patchItem(selected.id, {
                    capacities: {
                      ...selected.capacities,
                      butacas: Number(v) || 0,
                    },
                  })
                }
              />
              <EditField
                label="Cap. mesas"
                value={String(selected.capacities.mesas)}
                onChange={(v) =>
                  patchItem(selected.id, {
                    capacities: {
                      ...selected.capacities,
                      mesas: Number(v) || 0,
                    },
                  })
                }
              />
              <EditField
                label="Cap. herradura"
                value={String(selected.capacities.herradura)}
                onChange={(v) =>
                  patchItem(selected.id, {
                    capacities: {
                      ...selected.capacities,
                      herradura: Number(v) || 0,
                    },
                  })
                }
              />
            </div>
            <ImageField
              label="Foto del salón"
              media={selected.image}
              token={token}
              onChange={(image) => patchItem(selected.id, { image })}
            />
          </div>
        </EditPanelChrome>
      ) : null}
    </SalonesCmsEditContext.Provider>
  );
}

export function SalonesCmsEditProvider({ children }: { children: ReactNode }) {
  // En /cursos la edición de salones la maneja CursosCmsEditContext (un solo guardado).
  return <>{children}</>;
}
