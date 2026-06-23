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
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import {
  VIAJES_DESTINOS,
  viajeKey,
  type ViajeCategoriaSlug,
} from "@/lib/viajes";
import {
  buildDocWithViajes,
  getViajesForEdit,
  newSlug,
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
import { mergeViajeCategoriaPage } from "@/lib/cms/viajes-display";
import type {
  CmsDocument,
  CmsViajeCategoriaPage,
  CmsViaje,
  CmsViajesPage,
} from "@/lib/cms/types";
import {
  BodyField,
  EditField,
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
  ImageField,
} from "@/components/cms/CmsEditFields";

type ViajesCmsEditContextValue = {
  ready: boolean;
  categoria: ViajeCategoriaSlug | null;
  items: CmsViaje[];
  viajesPage: CmsViajesPage;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
  patchItem: (key: string, patch: Partial<CmsViaje>) => void;
  patchViajesHero: (
    categoria: ViajeCategoriaSlug,
    patch: Partial<CmsViajeCategoriaPage>,
  ) => void;
  addItem: () => void;
  hideItem: (key: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const ViajesCmsEditContext = createContext<ViajesCmsEditContextValue | null>(
  null,
);

export function useViajesCmsEdit() {
  return useContext(ViajesCmsEditContext);
}

function parseCategoriaFromPath(pathname: string): ViajeCategoriaSlug | null {
  const m = pathname.match(/\/cultura\/viajes\/(locales|internacionales)/);
  return (m?.[1] as ViajeCategoriaSlug) ?? null;
}

function ViajesCmsEditInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const categoria = parseCategoriaFromPath(pathname);
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsViaje[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [viajesPage, setViajesPage] = useState<CmsViajesPage>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
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
    const { items: loaded, hidden: h } = getViajesForEdit(
      draft,
      VIAJES_DESTINOS,
    );
    setItems(loaded);
    setHidden(h);
    setViajesPage(draft.sections.viajesPage ?? {});
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const merged = buildDocWithViajes(latest, items, hidden);
      const next = {
        ...merged,
        sections: { ...merged.sections, viajesPage },
      };
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
  }, [token, items, hidden, viajesPage]);

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
      const merged = buildDocWithViajes(latest, items, hidden);
      const next = {
        ...merged,
        sections: { ...merged.sections, viajesPage },
      };
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
  }, [token, items, hidden, viajesPage]);

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
    (key: string, patch: Partial<CmsViaje>) => {
      setItems((list) =>
        list.map((v) => {
          if (viajeKey(v) !== key) return v;
          const next = { ...v, ...patch };
          if (patch.title && patch.slug === undefined) {
            next.slug = newSlug(patch.title) || v.slug;
          }
          return next;
        }),
      );
      if (patch.slug) {
        const newKey = `${key.split("/")[0]}/${patch.slug}`;
        if (newKey !== key) setSelectedKey(newKey);
      }
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    if (!categoria) return;
    const slug = `nuevo-${Date.now().toString(36)}`;
    const entry: CmsViaje = {
      slug,
      categoria,
      title: "Nuevo destino",
      location: "",
      duration: "",
      excerpt: "",
      image: { src: "", alt: "" },
      body: [],
      highlights: [],
      proximaFecha: "",
      link: "",
      soloEnlace: true,
    };
    setItems((list) => [...list, entry]);
    setSelectedKey(viajeKey(entry));
    markDirty();
  }, [categoria, markDirty]);

  const hideItem = useCallback(
    (key: string) => {
      setItems((list) => list.filter((v) => viajeKey(v) !== key));
      setHidden((h) => (h.includes(key) ? h : [...h, key]));
      setSelectedKey(null);
      markDirty();
    },
    [markDirty],
  );

  const patchViajesHero = useCallback(
    (cat: ViajeCategoriaSlug, patch: Partial<CmsViajeCategoriaPage>) => {
      setViajesPage((p) => ({
        ...p,
        [cat]: { ...p[cat], ...patch },
      }));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): ViajesCmsEditContextValue => ({
      ready,
      categoria,
      items,
      viajesPage,
      selectedKey,
      setSelectedKey,
      patchItem,
      patchViajesHero,
      addItem,
      hideItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      categoria,
      items,
      viajesPage,
      selectedKey,
      patchItem,
      patchViajesHero,
      addItem,
      hideItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected =
    selectedKey && selectedKey !== "__hero__"
      ? items.find((v) => viajeKey(v) === selectedKey)
      : undefined;
  const toolbarLabel =
    categoria === "internacionales"
      ? "Viajes internacionales"
      : "Viajes locales";

  const heroValues =
    categoria != null
      ? mergeViajeCategoriaPage(categoria, viajesPage[categoria])
      : null;

  return (
    <ViajesCmsEditContext.Provider value={value}>
      <EditToolbar
        label={toolbarLabel}
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
          title="Editar destino"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedKey(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
              Los destinos fijos (Tres Ojos, Pomier, etc.) pueden recibir una{" "}
              <strong>próxima fecha</strong>. Para un sitio nuevo sin página,
              marca <strong>Solo enlace</strong> y pon la URL o WhatsApp.
            </p>
            <EditField
              label="Título"
              value={selected.title}
              onChange={(v) => {
                const key = viajeKey(selected);
                const nextSlug = newSlug(v) || selected.slug;
                patchItem(key, { title: v, slug: nextSlug });
                if (nextSlug !== selected.slug) {
                  setSelectedKey(`${selected.categoria}/${nextSlug}`);
                }
              }}
            />
            <p className="font-mono text-xs text-slate-500">{selected.slug}</p>
            {!selected.soloEnlace ? (
              <a
                href={`/cultura/viajes/${selected.categoria}/${selected.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm font-semibold text-na-kefer hover:underline"
              >
                Ver página en el sitio ↗
              </a>
            ) : null}
            <EditField
              label="Próxima fecha"
              value={selected.proximaFecha ?? ""}
              onChange={(v) =>
                patchItem(viajeKey(selected), { proximaFecha: v })
              }
            />
            <EditField
              label="Enlace (URL o WhatsApp)"
              value={selected.link ?? ""}
              onChange={(v) => patchItem(viajeKey(selected), { link: v })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(selected.soloEnlace)}
                onChange={(e) =>
                  patchItem(viajeKey(selected), {
                    soloEnlace: e.target.checked,
                  })
                }
              />
              Solo enlace (sin página de detalle en el sitio)
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Ubicación"
                value={selected.location}
                onChange={(v) =>
                  patchItem(viajeKey(selected), { location: v })
                }
              />
              <EditField
                label="Duración"
                value={selected.duration ?? ""}
                onChange={(v) =>
                  patchItem(viajeKey(selected), { duration: v })
                }
              />
            </div>
            <EditField
              label="Extracto"
              value={selected.excerpt}
              onChange={(v) => patchItem(viajeKey(selected), { excerpt: v })}
              multiline
            />
            <ImageField
              label="Foto"
              media={selected.image}
              token={token}
              onChange={(image) =>
                patchItem(viajeKey(selected), { image })
              }
            />
            {!selected.soloEnlace ? (
              <>
                <BodyField
                  body={selected.body}
                  onChange={(body) =>
                    patchItem(viajeKey(selected), { body })
                  }
                />
                <EditField
                  label="Qué incluye (una línea por punto)"
                  value={selected.highlights.join("\n")}
                  onChange={(v) =>
                    patchItem(viajeKey(selected), {
                      highlights: v
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  multiline
                />
              </>
            ) : null}
            {selected.link ? (
              <a
                href={selected.link}
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
                if (window.confirm("¿Ocultar este destino del sitio?")) {
                  hideItem(viajeKey(selected));
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedKey === "__hero__" && categoria ? (
        <EditPanelChrome
          title="Encabezado de la página"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedKey(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields
            value={heroValues ?? {}}
            onChange={(patch) => patchViajesHero(categoria, patch)}
          />
          <ImageField
            label="Foto de portada"
            media={heroValues?.heroImage ?? { src: "", alt: "" }}
            token={token}
            onChange={(heroImage) => patchViajesHero(categoria, { heroImage })}
          />
          <EditField
            label="Introducción (párrafo bajo el encabezado)"
            value={heroValues?.intro ?? ""}
            onChange={(v) => patchViajesHero(categoria, { intro: v })}
            multiline
          />
          <EditField
            label="Texto de la tarjeta en /cultura"
            value={heroValues?.cardText ?? ""}
            onChange={(v) => patchViajesHero(categoria, { cardText: v })}
            multiline
          />
        </EditPanelChrome>
      ) : null}
    </ViajesCmsEditContext.Provider>
  );
}

export function ViajesCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <ViajesCmsEditInner>{children}</ViajesCmsEditInner>;
}
