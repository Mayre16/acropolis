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
import { useCmsHydrated } from "@/lib/cms/hydration";
import { SALONES } from "@/lib/salones";
import {
  buildAcropolisDocWithSalones,
  buildCivisDocWithSalonesPage,
  getSalonesForEdit,
  DEFAULT_CIVIS_SALONES_PAGE,
} from "@/lib/cms/salones-edit";
import {
  fetchCmsDraft,
  publishCms,
  saveCmsDraft,
  uploadCmsImage,
  resolveCmsMediaUrl,
} from "@/lib/cms/api-client";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type {
  CmsCivisSalonesPage,
  CmsDocument,
  CmsMedia,
  CmsSalon,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
} from "@/components/cms/CmsEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { matchesAppPath } from "@/lib/cms/edit-mode";

const LAYOUT_OPTIONS = [
  { value: "butacas", label: "Butacas en filas" },
  { value: "mesas", label: "Mesas tipo escuela" },
  { value: "herradura", label: "Disposición herradura" },
] as const;

function AcropolisSalonImageField({
  label,
  media,
  token,
  onChange,
}: {
  label: string;
  media: CmsMedia;
  token: string | null;
  onChange: (m: CmsMedia) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(media.src);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file);
      onChange({ ...media, src: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <EditField
        label="URL imagen"
        value={media.src}
        onChange={(v) => onChange({ ...media, src: v })}
      />
      <EditField
        label="Texto alternativo"
        value={media.alt}
        onChange={(v) => onChange({ ...media, alt: v })}
      />
      <input
        type="file"
        accept="image/*"
        disabled={!token || uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f);
        }}
        className="block w-full text-xs"
      />
      {uploading ? <p className="text-xs text-amber-700">Subiendo…</p> : null}
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt=""
          className="mt-2 max-h-40 rounded-lg border object-cover"
        />
      ) : null}
    </fieldset>
  );
}

type SalonesCmsEditContextValue = {
  ready: boolean;
  items: CmsSalon[];
  page: CmsCivisSalonesPage;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchItem: (id: string, patch: Partial<CmsSalon>) => void;
  patchPage: (patch: Partial<CmsCivisSalonesPage>) => void;
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
  return useContext(SalonesCmsEditContext);
}

function SalonesCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [acropolisDoc, setAcropolisDoc] = useState<CmsDocument | null>(null);
  const [civisDoc, setCivisDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsSalon[]>([]);
  const [page, setPage] = useState<CmsCivisSalonesPage>(DEFAULT_CIVIS_SALONES_PAGE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const hydrated = useCmsHydrated();

  const ready = hydrated && !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoaded = useCallback(
    (acro: CmsDocument, civis: CmsDocument) => {
      setAcropolisDoc(acro);
      setCivisDoc(civis);
      setItems(getSalonesForEdit(acro, SALONES));
      setPage({
        ...DEFAULT_CIVIS_SALONES_PAGE,
        ...civis.sections.civisSalonesPage,
      });
      setDirty(false);
      postToEditor({ type: "cms-dirty", dirty: false });
    },
    [],
  );

  const persist = useCallback(async () => {
    if (!token || !acropolisDoc || !civisDoc) return;
    const acroLatest = await fetchCmsDraft("acropolis");
    const civisLatest = await fetchCmsDraft("civis");
    const acroNext = buildAcropolisDocWithSalones(acroLatest, items);
    const civisNext = buildCivisDocWithSalonesPage(civisLatest, page);
    await saveCmsDraft("acropolis", token, acroNext);
    await saveCmsDraft("civis", token, civisNext);
    setAcropolisDoc(acroNext);
    setCivisDoc(civisNext);
  }, [token, acropolisDoc, civisDoc, items, page]);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      await persist();
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
  }, [token, persist]);

  const publish = useCallback(async () => {
    if (!token) return;
    if (
      !window.confirm(
        "¿Publicar? Los salones se verán en Acrópolis y Civis; los textos de Civis solo en civis.acropolis.org.do.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("Publicando…");
    try {
      await persist();
      const acropolisResult = await publishCms("acropolis", token);
      const civisResult = await publishCms("civis", token);
      setDirty(false);
      setStatus(civisResult.message ?? acropolisResult.message ?? "Publicado.");
    } catch (e) {
      const text = String(e);
      setStatus(text);
      postToEditor({ type: "cms-status", text, ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, persist]);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      setToken(initToken);
      Promise.all([fetchCmsDraft("acropolis"), fetchCmsDraft("civis")])
        .then(([acro, civis]) => {
          applyLoaded(acro, civis);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "civis");
  }, [applyLoaded]);

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
    (patch: Partial<CmsCivisSalonesPage>) => {
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
          title="Textos de la página Salones"
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
              label="Título principal"
              value={page.title ?? ""}
              onChange={(v) => patchPage({ title: v })}
            />
            <EditField
              label="Introducción"
              value={page.lede ?? ""}
              onChange={(v) => patchPage({ lede: v })}
              multiline
            />
            <EditField
              label="Título del catálogo"
              value={page.catalogTitle ?? ""}
              onChange={(v) => patchPage({ catalogTitle: v })}
            />
            <EditField
              label="Intro del catálogo"
              value={page.catalogIntro ?? ""}
              onChange={(v) => patchPage({ catalogIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selected && selectedId !== "__section__" ? (
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
              <span className="font-semibold text-slate-700">Sede</span>
              <select
                value={selected.sede}
                onChange={(e) =>
                  patchItem(selected.id, {
                    sede: e.target.value as CmsSalon["sede"],
                  })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="Naco">Naco</option>
                <option value="Los Prados">Los Prados</option>
                <option value="Santiago">Santiago</option>
              </select>
            </label>
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
            <AcropolisSalonImageField
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
  const editMode = useCmsEditMode();
  const pathname = usePathname();
  if (editMode !== "1" || !matchesAppPath(pathname, "/salones")) {
    return <>{children}</>;
  }
  return <SalonesCmsEditInner>{children}</SalonesCmsEditInner>;
}
