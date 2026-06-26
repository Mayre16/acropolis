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
import { EVENTOS } from "@/lib/eventos";
import {
  buildDocWithEventos,
  ensureUniqueSlug,
  getEventosForEdit,
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
import type { CmsDocument, CmsEvento, CmsEventosPage } from "@/lib/cms/types";
import {
  BodyField,
  EditField,
  EditPanelChrome,
  EditToolbar,
  GalleryField,
  HeroEditFields,
  ImageField,
} from "@/components/cms/CmsEditFields";
import {
  PublishCategorySelect,
  SeoTagsField,
} from "@/components/cms/PublishCategoryFields";
import { normalizeCmsEventoCategory } from "@/lib/agenda-publish-categories";
import type { AgendaCategory } from "@/lib/agenda";

type EventosCmsEditContextValue = {
  ready: boolean;
  items: CmsEvento[];
  page: CmsEventosPage;
  selectedSlug: string | null;
  setSelectedSlug: (slug: string | null) => void;
  patchItem: (slug: string, patch: Partial<CmsEvento>) => void;
  patchPage: (patch: Partial<CmsEventosPage>) => void;
  addItem: () => void;
  hideItem: (slug: string) => void;
  publishItem: (slug: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const EventosCmsEditContext = createContext<EventosCmsEditContextValue | null>(
  null,
);

export function useEventosCmsEdit() {
  return useContext(EventosCmsEditContext);
}

function EventosCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsEvento[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [page, setPage] = useState<CmsEventosPage>({});
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
    const { items: loaded, hidden: h } = getEventosForEdit(draft, EVENTOS);
    setItems(loaded);
    setHidden(h);
    setPage(draft.sections.eventosPage ?? {});
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const getBuiltDoc = useCallback(() => {
    if (!doc) return null;
    const withEventos = buildDocWithEventos(doc, items, hidden);
    return mergeHeroCarouselsIntoDoc({
      ...withEventos,
      sections: { ...withEventos.sections, eventosPage: page },
    });
  }, [doc, items, hidden, page]);

  const saveDraft = useCallback(async () => {
    if (!token || !doc) return;
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
  }, [token, doc, getBuiltDoc]);

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
    (slug: string, patch: Partial<CmsEvento>) => {
      setItems((list) =>
        list.map((e) => (e.slug === slug ? { ...e, ...patch } : e)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    const title = "Nuevo evento";
    setItems((list) => {
      const slug = uniqueSlug(
        title,
        list.map((e) => e.slug),
      );
      const entry: CmsEvento = {
        slug,
        title,
        date: "",
        category: "cultura",
        excerpt: "",
        image: { src: "", alt: "" },
        gallery: [],
        body: [""],
        published: false,
        seoTags: [],
      };
      setSelectedSlug(slug);
      return [...list, entry];
    });
    markDirty();
  }, [markDirty]);

  const publishItem = useCallback(
    (slug: string) => {
      patchItem(slug, { published: true });
    },
    [patchItem],
  );

  const hideItem = useCallback(
    (slug: string) => {
      setItems((list) => list.filter((e) => e.slug !== slug));
      setHidden((h) => (h.includes(slug) ? h : [...h, slug]));
      setSelectedSlug(null);
      markDirty();
    },
    [markDirty],
  );

  const patchPage = useCallback(
    (patch: Partial<CmsEventosPage>) => {
      setPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): EventosCmsEditContextValue => ({
      ready,
      items,
      page,
      selectedSlug,
      setSelectedSlug,
      patchItem,
      patchPage,
      addItem,
      hideItem,
      publishItem,
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
      publishItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected =
    selectedSlug && selectedSlug !== "__hero__"
      ? items.find((e) => e.slug === selectedSlug)
      : undefined;

  const selectedCategoryId: AgendaCategory | null = selected
    ? normalizeCmsEventoCategory(selected.category)
    : null;

  return (
    <EventosCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Eventos"
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
          title="Editar evento"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedSlug(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={selected.title}
              onChange={(v) => {
                if (shouldAutoUpdateSlug(selected.slug, selected.title)) {
                  const nextSlug = uniqueSlug(
                    v,
                    items.map((e) => e.slug),
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
                  items.map((e) => e.slug),
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
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Fecha"
                value={selected.date}
                onChange={(v) => patchItem(selected.slug, { date: v })}
              />
            </div>
            {selectedCategoryId ? (
              <PublishCategorySelect
                value={selectedCategoryId}
                onChange={(category) =>
                  patchItem(selected.slug, { category })
                }
              />
            ) : null}
            {selectedCategoryId ? (
              <SeoTagsField
                category={selectedCategoryId}
                value={selected.seoTags}
                onChange={(seoTags) =>
                  patchItem(selected.slug, { seoTags })
                }
              />
            ) : null}
            <EditField
              label="Extracto (tarjeta)"
              value={selected.excerpt}
              onChange={(v) => patchItem(selected.slug, { excerpt: v })}
              multiline
            />
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
            {selected.published === false ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                <p className="font-semibold">Borrador — oculto en /eventos</p>
                <p className="mt-1 text-xs">
                  Completa la crónica y publícala cuando esté lista.
                  {selected.sourceAgendaId
                    ? ` Origen: agenda ${selected.sourceAgendaId}.`
                    : null}
                </p>
                <button
                  type="button"
                  onClick={() => publishItem(selected.slug)}
                  className="mt-3 w-full rounded-lg bg-na-heket py-2 text-sm font-bold text-white"
                >
                  Publicar crónica
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => patchItem(selected.slug, { published: false })}
                className="w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700"
              >
                Pasar a borrador
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar este evento del sitio?")) {
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
          <HeroEditFields value={page} onChange={patchPage} carouselKey="eventos" />
        </EditPanelChrome>
      ) : null}
    </EventosCmsEditContext.Provider>
  );
}

export function EventosCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <EventosCmsEditInner>{children}</EventosCmsEditInner>;
}

