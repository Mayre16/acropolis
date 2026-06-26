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
import { ARTICULOS } from "@/lib/articulos";
import {
  buildDocWithArticulos,
  ensureUniqueSlug,
  getArticulosForEdit,
  shouldAutoUpdateSlug,
  uniqueSlug,
} from "@/lib/cms/content-edit";
import {
  fetchCmsDraft,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type { CmsArticulo, CmsArticulosPage, CmsDocument } from "@/lib/cms/types";
import {
  BodyField,
  EditField,
  EditPanelChrome,
  EditToolbar,
  GalleryField,
  HeroEditFields,
  ImageField,
} from "@/components/cms/CmsEditFields";

type ArticulosCmsEditContextValue = {
  ready: boolean;
  items: CmsArticulo[];
  page: CmsArticulosPage;
  selectedSlug: string | null;
  setSelectedSlug: (slug: string | null) => void;
  patchItem: (slug: string, patch: Partial<CmsArticulo>) => void;
  patchPage: (patch: Partial<CmsArticulosPage>) => void;
  addItem: () => void;
  hideItem: (slug: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const ArticulosCmsEditContext =
  createContext<ArticulosCmsEditContextValue | null>(null);

export function useArticulosCmsEdit() {
  return useContext(ArticulosCmsEditContext);
}

function ArticulosCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsArticulo[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [page, setPage] = useState<CmsArticulosPage>({});
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
    const { items: loaded, hidden: h } = getArticulosForEdit(draft, ARTICULOS);
    setItems(loaded);
    setHidden(h);
    setPage(draft.sections.articulosPage ?? {});
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const merged = buildDocWithArticulos(latest, items, hidden);
      const next = mergeHeroCarouselsIntoDoc({
        ...merged,
        sections: { ...merged.sections, articulosPage: page },
      });
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
  }, [token, items, hidden, page]);

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

  const patchItem = useCallback(
    (slug: string, patch: Partial<CmsArticulo>) => {
      setItems((list) =>
        list.map((a) => (a.slug === slug ? { ...a, ...patch } : a)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    const title = "Nuevo artículo";
    setItems((list) => {
      const slug = uniqueSlug(
        title,
        list.map((a) => a.slug),
      );
      const entry: CmsArticulo = {
        slug,
        title,
        author: "Nueva Acrópolis RD",
        date: "",
        readingTime: "5 min",
        category: "",
        excerpt: "",
        image: { src: "", alt: "" },
        gallery: [],
        body: [""],
      };
      setSelectedSlug(slug);
      return [...list, entry];
    });
    markDirty();
  }, [markDirty]);

  const hideItem = useCallback(
    (slug: string) => {
      setItems((list) => list.filter((a) => a.slug !== slug));
      setHidden((h) => (h.includes(slug) ? h : [...h, slug]));
      setSelectedSlug(null);
      markDirty();
    },
    [markDirty],
  );

  const patchPage = useCallback(
    (patch: Partial<CmsArticulosPage>) => {
      setPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): ArticulosCmsEditContextValue => ({
      ready,
      items,
      page,
      selectedSlug,
      setSelectedSlug,
      patchItem,
      patchPage,
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
      items,
      page,
      selectedSlug,
      patchItem,
      patchPage,
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
    selectedSlug && selectedSlug !== "__hero__"
      ? items.find((a) => a.slug === selectedSlug)
      : undefined;

  return (
    <ArticulosCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Artículos"
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
          title="Editar artículo"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedSlug(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <strong>Artículo propio</strong> — página completa en este sitio.
              Para un enlace a un medio externo usa{" "}
              <strong>Voz fuera de la sede</strong> (pestaña o botón abajo en la
              página).
            </p>
            <EditField
              label="Título"
              value={selected.title}
              onChange={(v) => {
                if (shouldAutoUpdateSlug(selected.slug, selected.title)) {
                  const nextSlug = uniqueSlug(
                    v,
                    items.map((a) => a.slug),
                    selected.slug,
                  );
                  patchItem(selected.slug, { title: v, slug: nextSlug });
                  if (nextSlug !== selected.slug) setSelectedSlug(nextSlug);
                } else {
                  patchItem(selected.slug, { title: v });
                }
              }}
            />
            <EditField
              label="URL (slug)"
              value={selected.slug}
              onChange={(v) => {
                const nextSlug = ensureUniqueSlug(
                  v,
                  items.map((a) => a.slug),
                  selected.slug,
                );
                patchItem(selected.slug, { slug: nextSlug });
                if (nextSlug !== selected.slug) setSelectedSlug(nextSlug);
              }}
            />
            <p className="text-xs text-slate-500">
              Solo letras minúsculas, números y guiones. Ejemplo:{" "}
              <span className="font-mono">12-formas-de-reflexionar</span>
            </p>
            <a
              href={`/${selected.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-na-kefer hover:underline"
            >
              Ver artículo en el sitio ↗
            </a>
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Autor"
                value={selected.author}
                onChange={(v) => patchItem(selected.slug, { author: v })}
              />
              <EditField
                label="Fecha"
                value={selected.date}
                onChange={(v) => patchItem(selected.slug, { date: v })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Categoría"
                value={selected.category}
                onChange={(v) => patchItem(selected.slug, { category: v })}
              />
              <EditField
                label="Tiempo de lectura"
                value={selected.readingTime}
                onChange={(v) => patchItem(selected.slug, { readingTime: v })}
              />
            </div>
            <EditField
              label="Extracto"
              value={selected.excerpt}
              onChange={(v) => patchItem(selected.slug, { excerpt: v })}
              multiline
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(selected.featured)}
                onChange={(e) =>
                  patchItem(selected.slug, { featured: e.target.checked })
                }
              />
              Destacado en listado
            </label>
            <ImageField
              label="Foto portada"
              media={selected.image}
              token={token}
              onChange={(image) => patchItem(selected.slug, { image })}
            />
            <BodyField
              body={selected.body}
              onChange={(body) => patchItem(selected.slug, { body })}
            />
            <GalleryField
              images={selected.gallery ?? []}
              token={token}
              onChange={(gallery) => patchItem(selected.slug, { gallery })}
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar este artículo del sitio?")) {
                  hideItem(selected.slug);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedSlug === "__hero__" ? (
        <EditPanelChrome
          title="Encabezado de la página"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedSlug(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields value={page} onChange={patchPage} carouselKey="articulos" />
        </EditPanelChrome>
      ) : null}
    </ArticulosCmsEditContext.Provider>
  );
}

export function ArticulosCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <ArticulosCmsEditInner>{children}</ArticulosCmsEditInner>;
}

