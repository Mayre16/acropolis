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
import { Images, Plus } from "lucide-react";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import {
  fetchCmsDraft,
  publishCms,
  resolveCmsMediaUrl,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import type { CmsDocument } from "@/lib/cms/types";
import {
  getHeroSlidesForKey,
  HERO_CAROUSEL_LABELS,
  loadHeroCarouselsFromDoc,
  newHeroSlideId,
  sanitizeHeroCarousels,
  type CmsHeroCarouselItem,
  type CmsHeroCarouselKey,
  type CmsHeroCarousels,
} from "@/lib/cms/hero-carousel-edit";
import { setHeroCarouselsSnapshot } from "@/lib/cms/hero-carousel-registry";
import {
  EditField,
  EditPanelChrome,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";

type HeroCarouselCmsEditContextValue = {
  ready: boolean;
  token: string | null;
  carousels: CmsHeroCarousels;
  selectedKey: CmsHeroCarouselKey | null;
  selectedSlideId: string | null;
  openCarousel: (key: CmsHeroCarouselKey) => void;
  openSlide: (key: CmsHeroCarouselKey, slideId: string) => void;
  closePanel: () => void;
  patchSlide: (
    key: CmsHeroCarouselKey,
    slideId: string,
    patch: Partial<CmsHeroCarouselItem>,
  ) => void;
  addSlide: (key: CmsHeroCarouselKey) => void;
  removeSlide: (key: CmsHeroCarouselKey, slideId: string) => void;
  markDirty: () => void;
};

const HeroCarouselCmsEditContext =
  createContext<HeroCarouselCmsEditContextValue | null>(null);

export function useHeroCarouselCmsEdit() {
  return useContext(HeroCarouselCmsEditContext);
}

function HeroCarouselCmsEditInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [carousels, setCarousels] = useState<CmsHeroCarousels>({});
  const [selectedKey, setSelectedKey] = useState<CmsHeroCarouselKey | null>(
    null,
  );
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const ready = !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  useEffect(() => {
    setHeroCarouselsSnapshot(sanitizeHeroCarousels(carousels));
  }, [carousels]);

  const buildDoc = useCallback(
    (base: CmsDocument): CmsDocument => ({
      ...base,
      sections: {
        ...base.sections,
        heroCarousels: {
          ...base.sections.heroCarousels,
          ...sanitizeHeroCarousels(carousels),
        },
      },
    }),
    [carousels],
  );

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDoc(latest);
      await saveCmsDraft("acropolis", token, next);
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
  }, [token, buildDoc]);

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
      const next = buildDoc(latest);
      await saveCmsDraft("acropolis", token, next);
      const publishResult = await publishCms("acropolis", token);
      setDirty(false);
      setStatus(publishResult.message ?? "Publicado.");
} catch (e) {
      const text = String(e);
      setStatus(text);
      postToEditor({ type: "cms-status", text, ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, buildDoc]);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setCarousels(loadHeroCarouselsFromDoc(draft));
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
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

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      // El guardado lo hace el proveedor de la página (mergeHeroCarouselsIntoDoc).
      if (msg.type === "cms-publish") void publish();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [publish]);

  useEffect(() => {
    setSelectedKey(null);
    setSelectedSlideId(null);
  }, [pathname]);

  const ensureKey = useCallback(
    (key: CmsHeroCarouselKey): CmsHeroCarouselItem[] => {
      return getHeroSlidesForKey(carousels, key);
    },
    [carousels],
  );

  const patchSlide = useCallback(
    (
      key: CmsHeroCarouselKey,
      slideId: string,
      patch: Partial<CmsHeroCarouselItem>,
    ) => {
      setCarousels((prev) => {
        const slides = getHeroSlidesForKey(prev, key).map((s) =>
          s.id === slideId ? { ...s, ...patch } : s,
        );
        return { ...prev, [key]: slides };
      });
      markDirty();
    },
    [markDirty],
  );

  const addSlide = useCallback(
    (key: CmsHeroCarouselKey) => {
      const slide: CmsHeroCarouselItem = {
        id: newHeroSlideId(),
        src: "",
        alt: "Nueva foto del carrusel",
      };
      setCarousels((prev) => {
        const slides = [...getHeroSlidesForKey(prev, key), slide];
        return { ...prev, [key]: slides };
      });
      setSelectedKey(key);
      setSelectedSlideId(slide.id);
      markDirty();
    },
    [markDirty],
  );

  const removeSlide = useCallback(
    (key: CmsHeroCarouselKey, slideId: string) => {
      setCarousels((prev) => {
        const slides = getHeroSlidesForKey(prev, key).filter(
          (s) => s.id !== slideId,
        );
        return { ...prev, [key]: slides };
      });
      setSelectedSlideId(null);
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): HeroCarouselCmsEditContextValue => ({
      ready,
      token,
      carousels,
      selectedKey,
      selectedSlideId,
      openCarousel: (key) => {
        ensureKey(key);
        setSelectedKey(key);
        setSelectedSlideId(null);
      },
      openSlide: (key, slideId) => {
        setSelectedKey(key);
        setSelectedSlideId(slideId);
      },
      closePanel: () => {
        setSelectedKey(null);
        setSelectedSlideId(null);
      },
      patchSlide,
      addSlide,
      removeSlide,
      markDirty,
    }),
    [
      ready,
      token,
      carousels,
      selectedKey,
      selectedSlideId,
      ensureKey,
      patchSlide,
      addSlide,
      removeSlide,
      markDirty,
    ],
  );

  const selectedSlide =
    selectedKey && selectedSlideId
      ? getHeroSlidesForKey(carousels, selectedKey).find(
          (s) => s.id === selectedSlideId,
        )
      : null;

  const slidesForPanel = selectedKey
    ? getHeroSlidesForKey(carousels, selectedKey)
    : [];

  return (
    <HeroCarouselCmsEditContext.Provider value={value}>
      {children}
      {selectedKey ? (
        <EditPanelChrome
          title={
            selectedSlide
              ? `Foto del carrusel — ${HERO_CAROUSEL_LABELS[selectedKey]}`
              : `Carrusel — ${HERO_CAROUSEL_LABELS[selectedKey]}`
          }
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => value.closePanel()}
          onSave={() => {
            markDirty();
            postToEditor({ type: "cms-save" });
          }}
        >
          {selectedSlide ? (
            <HeroSlideEditFields
              slide={selectedSlide}
              token={token}
              onChange={(patch) =>
                value.patchSlide(selectedKey, selectedSlide.id, patch)
              }
              onDelete={() => {
                if (
                  window.confirm(
                    "¿Quitar esta foto del carrusel? Puedes añadir otra después.",
                  )
                ) {
                  value.removeSlide(selectedKey, selectedSlide.id);
                }
              }}
              onBack={() => setSelectedSlideId(null)}
            />
          ) : (
            <HeroCarouselListPanel
              slides={slidesForPanel}
              onSelectSlide={(id) => setSelectedSlideId(id)}
              onAdd={() => value.addSlide(selectedKey)}
            />
          )}
        </EditPanelChrome>
      ) : null}
    </HeroCarouselCmsEditContext.Provider>
  );
}

function HeroCarouselListPanel({
  slides,
  onSelectSlide,
  onAdd,
}: {
  slides: CmsHeroCarouselItem[];
  onSelectSlide: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Haz clic en una foto para cambiar la ruta, subir una imagen o quitarla.
        Usa «Añadir foto» para agregar una nueva al carrusel.
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slides.map((slide, i) => {
          const src = resolveCmsMediaUrl(slide.src) ?? slide.src;
          const preview =
            slide.media === "video" && slide.poster
              ? (resolveCmsMediaUrl(slide.poster) ?? slide.poster)
              : src;
          return (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => onSelectSlide(slide.id)}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt={slide.alt || `Foto ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-slate-400">
                    Sin imagen
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-left text-[10px] font-semibold text-white">
                  Foto {i + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-400 py-3 text-sm font-bold text-amber-800"
      >
        <Plus className="h-4 w-4" />
        Añadir foto
      </button>
    </div>
  );
}

function HeroSlideEditFields({
  slide,
  token,
  onChange,
  onDelete,
  onBack,
}: {
  slide: CmsHeroCarouselItem;
  token: string | null;
  onChange: (patch: Partial<CmsHeroCarouselItem>) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-amber-700 hover:underline"
      >
        ← Volver al listado
      </button>
      <AgendaEntryImageField
        label="Foto del carrusel"
        site="acropolis"
        image={slide.src}
        imageAlt={slide.alt}
        token={token}
        onChange={(patch) => {
          if (patch.image !== undefined) onChange({ src: patch.image });
          if (patch.imageAlt !== undefined) onChange({ alt: patch.imageAlt });
        }}
      />
      {!slide.src?.trim() ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Esta foto aún no tiene imagen. Usa el campo <strong>Ruta de la imagen</strong> o
          sube un archivo <strong>WebP</strong>. Las fotos vacías no aparecen en el carrusel.
        </p>
      ) : null}
      <EditField
        label="Tipo de medio"
        value={slide.media === "video" ? "video" : "imagen"}
        onChange={(v) =>
          onChange({
            media: v === "video" ? "video" : undefined,
            poster: v === "video" ? slide.poster : undefined,
          })
        }
      />
      {slide.media === "video" ? (
        <>
          <EditField
            label="URL del vídeo (mp4)"
            value={slide.src}
            onChange={(v) => onChange({ src: v })}
          />
          <EditField
            label="Imagen de respaldo (poster)"
            value={slide.poster ?? ""}
            onChange={(v) => onChange({ poster: v || undefined })}
          />
        </>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
      >
        Quitar foto del carrusel
      </button>
    </div>
  );
}

export function HeroCarouselCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (!editMode) return <>{children}</>;
  return <HeroCarouselCmsEditInner>{children}</HeroCarouselCmsEditInner>;
}

/** Botón para abrir el editor del carrusel en el hero de una página. */
export function HeroCarouselEditButton({
  carouselKey,
  className = "right-4 top-36",
}: {
  carouselKey: CmsHeroCarouselKey;
  className?: string;
}) {
  const edit = useHeroCarouselCmsEdit();
  if (!edit?.ready) return null;
  return (
    <button
      type="button"
      onClick={() => edit.openCarousel(carouselKey)}
      className={`absolute z-20 inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase tracking-wide text-na-ink shadow-lg ${className}`}
    >
      <Images className="h-4 w-4" />
      Editar carrusel
    </button>
  );
}
