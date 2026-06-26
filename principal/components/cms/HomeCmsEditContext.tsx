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
import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { ALL_AGENDA_ENTRIES } from "@/lib/agenda-registry";
import {
  getHomeCarouselEntries,
  mergeAgendaEntriesIntoDoc,
  newAgendaId,
} from "@/lib/cms/agenda-edit";
import { ACTIVITY_PHOTOS, HOME_ACTIVITY_PHOTOS_LIMIT } from "@/lib/home-content";
import { DEFAULT_HOME_PAGE, mergeHomePage } from "@/lib/cms/home-page-edit";
import {
  CIRCULO_AMIGOS_SELECTED_ID,
  mergeCirculoAmigos,
} from "@/lib/cms/circulo-amigos-display";
import {
  DEFAULT_ESFERA_PAGE,
  ESFERA_HOME_PROMO_SECTION_ID,
  mergeEsferaHomePromo,
  mergeEsferaPage,
  pickEsferaHomePromo,
} from "@/lib/cms/esfera-page-edit";
import {
  fetchCmsDraft,
  resolveCmsMediaUrl,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import type {
  CmsActivityPhoto,
  CmsAgendaEntry,
  CmsCirculoAmigosPromo,
  CmsDocument,
  CmsEsferaHomePromo,
  CmsEvento,
  CmsHomePage,
  CmsHomePillar,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryEditFields, AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import { CirculoAmigosEditFields } from "@/components/cms/CirculoAmigosEditFields";
import { EsferaHomeEditFields, type EsferaHomeLogoFields } from "@/components/cms/EsferaHomeEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { isInEditorIframe, readStoredCmsEditMode } from "@/lib/cms/edit-mode";
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { appendEventoDraftsToDoc } from "@/lib/cms/content-edit";
import { promoteAgendaEntryLocally } from "@/lib/agenda-evento";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import { useCmsActivityPhotos } from "@/lib/cms/hooks";

type HomeSelectedKind =
  | "carousel"
  | "photo"
  | "hero"
  | "whatIsNa"
  | "pillar"
  | "philosophyBand"
  | "circuloAmigos"
  | "esferaHome"
  | null;

type HomeCmsEditContextValue = {
  ready: boolean;
  carousel: CmsAgendaEntry[];
  photos: CmsActivityPhoto[];
  homePage: CmsHomePage;
  circuloAmigos: CmsCirculoAmigosPromo;
  esferaHomePromo: CmsEsferaHomePromo;
  esferaLogo: EsferaHomeLogoFields;
  homeHero: {
    h1?: string;
    h2?: string;
    lede?: string;
    background?: { src: string; alt: string };
  };
  selectedKind: HomeSelectedKind;
  selectedId: string | null;
  setSelected: (kind: HomeSelectedKind, id: string | null) => void;
  patchCarousel: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  patchPhoto: (index: number, patch: Partial<CmsActivityPhoto>) => void;
  patchHomePage: (patch: Partial<CmsHomePage>) => void;
  patchPillar: (id: string, patch: Partial<CmsHomePillar>) => void;
  patchCirculoAmigos: (patch: Partial<CmsCirculoAmigosPromo>) => void;
  patchEsferaHomePromo: (patch: Partial<CmsEsferaHomePromo>) => void;
  patchEsferaLogo: (patch: Partial<EsferaHomeLogoFields>) => void;
  patchHomeHero: (patch: {
    h1?: string;
    h2?: string;
    lede?: string;
    background?: { src: string; alt: string };
  }) => void;
  addCarousel: () => void;
  addPhoto: () => void;
  deletePhoto: (index: number) => void;
  deleteCarousel: (id: string) => void;
  promoteCarouselToEvento: (entry: CmsAgendaEntry) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const HomeCmsEditContext = createContext<HomeCmsEditContextValue | null>(null);

export function useHomeCmsEdit() {
  return useContext(HomeCmsEditContext);
}

function HomeCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [carousel, setCarousel] = useState<CmsAgendaEntry[]>([]);
  const [photos, setPhotos] = useState<CmsActivityPhoto[]>([]);
  const [homeHero, setHomeHero] = useState<{
    h1?: string;
    h2?: string;
    lede?: string;
    background?: { src: string; alt: string };
  }>({});
  const [homePage, setHomePage] = useState<CmsHomePage>(DEFAULT_HOME_PAGE);
  const [circuloAmigos, setCirculoAmigos] = useState<CmsCirculoAmigosPromo>(
    mergeCirculoAmigos(),
  );
  const [esferaHomePromo, setEsferaHomePromo] = useState<CmsEsferaHomePromo>(
    mergeEsferaHomePromo(),
  );
  const [esferaLogo, setEsferaLogo] = useState<EsferaHomeLogoFields>({
    esferaLogoSrc: DEFAULT_ESFERA_PAGE.esferaLogoSrc,
    esferaLogoWhiteSrc: DEFAULT_ESFERA_PAGE.esferaLogoWhiteSrc,
    esferaLogoAlt: DEFAULT_ESFERA_PAGE.esferaLogoAlt,
  });
  const [hidden, setHidden] = useState<string[]>([]);
  const [eventoDrafts, setEventoDrafts] = useState<CmsEvento[]>([]);
  const [selectedKind, setSelectedKind] = useState<HomeSelectedKind>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const ready = !!token && draftLoaded;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setCarousel(getHomeCarouselEntries(draft, ALL_AGENDA_ENTRIES));
    setPhotos(
      draft.sections.activityPhotos?.length
        ? draft.sections.activityPhotos
        : ACTIVITY_PHOTOS.map((p) => ({
            src: p.src,
            alt: p.alt,
            caption: p.caption,
          })),
    );
    setHidden(draft.sections.agendaHidden ?? []);
    setHomeHero(draft.sections.homeHero ?? {});
    setHomePage(mergeHomePage(draft.sections.homePage));
    setCirculoAmigos(
      mergeCirculoAmigos(draft.sections.culturaPage?.circuloAmigos),
    );
    setEsferaHomePromo(
      pickEsferaHomePromo(mergeEsferaPage(draft.sections.esferaPage)),
    );
    const mergedEsfera = mergeEsferaPage(draft.sections.esferaPage);
    setEsferaLogo({
      esferaLogoSrc: mergedEsfera.esferaLogoSrc,
      esferaLogoWhiteSrc: mergedEsfera.esferaLogoWhiteSrc,
      esferaLogoAlt: mergedEsfera.esferaLogoAlt,
    });
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const buildDoc = useCallback(
    (base: CmsDocument): CmsDocument => {
      const merged = mergeAgendaEntriesIntoDoc(base, carousel, hidden);
      const withDrafts = appendEventoDraftsToDoc(merged, eventoDrafts);
      return mergeHeroCarouselsIntoDoc({
        ...withDrafts,
        sections: {
          ...withDrafts.sections,
          activityPhotos: photos,
          homeHero,
          homePage,
          culturaPage: {
            ...merged.sections.culturaPage,
            circuloAmigos,
          },
          esferaPage: {
            ...merged.sections.esferaPage,
            ...esferaHomePromo,
            ...esferaLogo,
          },
        },
      });
    },
    [carousel, photos, hidden, eventoDrafts, homeHero, homePage, circuloAmigos, esferaHomePromo, esferaLogo],
  );

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    try {
      const latest = await fetchCmsDraft("acropolis");
      await saveCmsDraft("acropolis", token, buildDoc(latest));
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
  }, [token, buildDoc]);

  const publish = useCallback(async () => {
    await runCoordinatedCmsPublish();
  }, []);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      setToken(initToken);
      fetchCmsDraft("acropolis")
        .then((draft) => {
          applyLoadedDoc(draft);
          setDraftLoaded(true);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "acropolis");
  }, [applyLoadedDoc]);

  useCmsEditBridge(saveDraft);

  const setSelected = useCallback(
    (kind: HomeSelectedKind, id: string | null) => {
      setSelectedKind(kind);
      setSelectedId(id);
    },
    [],
  );

  const patchHomePage = useCallback(
    (patch: Partial<CmsHomePage>) => {
      setHomePage((p) => mergeHomePage({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchPillar = useCallback(
    (id: string, patch: Partial<CmsHomePillar>) => {
      setHomePage((p) => {
        const merged = mergeHomePage(p);
        return {
          ...merged,
          pillars: (merged.pillars ?? []).map((pillar) =>
            pillar.id === id ? { ...pillar, ...patch } : pillar,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchHomeHero = useCallback(
    (patch: {
      h1?: string;
      h2?: string;
      lede?: string;
      background?: { src: string; alt: string };
    }) => {
      setHomeHero((h) => ({ ...h, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchCirculoAmigos = useCallback(
    (patch: Partial<CmsCirculoAmigosPromo>) => {
      setCirculoAmigos((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchEsferaHomePromo = useCallback(
    (patch: Partial<CmsEsferaHomePromo>) => {
      setEsferaHomePromo((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchEsferaLogo = useCallback(
    (patch: Partial<EsferaHomeLogoFields>) => {
      setEsferaLogo((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): HomeCmsEditContextValue => ({
      ready,
      carousel,
      photos,
      homePage,
      circuloAmigos,
      esferaHomePromo,
      esferaLogo,
      homeHero,
      selectedKind,
      selectedId,
      setSelected,
      patchHomePage,
      patchPillar,
      patchCirculoAmigos,
      patchEsferaHomePromo,
      patchEsferaLogo,
      patchHomeHero,
      patchCarousel: (id, patch) => {
        setCarousel((list) =>
          list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        );
        markDirty();
      },
      patchPhoto: (index, patch) => {
        setPhotos((list) =>
          list.map((p, i) => (i === index ? { ...p, ...patch } : p)),
        );
        markDirty();
      },
      addCarousel: () => {
        const entry: CmsAgendaEntry = {
          id: newAgendaId(),
          category: "conferencia",
          title: "Nueva actividad",
          startsAt: new Date().toISOString().slice(0, 10),
          date: "",
          showOnHome: true,
        };
        setCarousel((list) => [...list, entry]);
        setSelected("carousel", entry.id);
        markDirty();
      },
      addPhoto: () => {
        setPhotos((list) => {
          const next = [
            ...list,
            { src: "", alt: "Nueva foto", caption: "" },
          ];
          setSelected("photo", String(next.length - 1));
          return next;
        });
        markDirty();
      },
      deletePhoto: (index) => {
        setPhotos((list) => list.filter((_, i) => i !== index));
        setSelected(null, null);
        markDirty();
      },
      deleteCarousel: (id) => {
        setCarousel((list) => list.filter((e) => e.id !== id));
        setHidden((h) => (h.includes(id) ? h : [...h, id]));
        setSelected(null, null);
        markDirty();
      },
      promoteCarouselToEvento: (entry) => {
        const existingSlugs = eventoDrafts.map((e) => e.slug);
        const { updatedEntry, draft } = promoteAgendaEntryLocally(
          entry,
          existingSlugs,
        );
        setCarousel((list) =>
          list.map((e) => (e.id === entry.id ? updatedEntry : e)),
        );
        setEventoDrafts((list) => [...list, draft]);
        markDirty();
        window.alert(
          `Borrador creado: /eventos/${draft.slug}. Edítalo y publícalo en Eventos.`,
        );
      },
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      carousel,
      photos,
      homePage,
      circuloAmigos,
      esferaHomePromo,
      esferaLogo,
      homeHero,
      selectedKind,
      selectedId,
      setSelected,
      patchHomePage,
      patchPillar,
      patchCirculoAmigos,
      patchEsferaHomePromo,
      patchEsferaLogo,
      patchHomeHero,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
      markDirty,
      eventoDrafts,
      photos.length,
    ],
  );

  const selectedCarousel = carousel.find((e) => e.id === selectedId);
  const selectedPhotoIndex =
    selectedKind === "photo" && selectedId != null
      ? Number(selectedId)
      : null;
  const selectedPillar =
    selectedKind === "pillar" && selectedId
      ? (homePage.pillars ?? []).find((p) => p.id === selectedId)
      : null;
  const whatIsNa = homePage.whatIsNa ?? DEFAULT_HOME_PAGE.whatIsNa!;
  const philosophyBand =
    homePage.philosophyBand ?? DEFAULT_HOME_PAGE.philosophyBand!;

  return (
    <HomeCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Inicio"
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
      {selectedKind === "carousel" && selectedCarousel ? (
        <EditPanelChrome
          title="Editar actividad del carrusel"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <AgendaEntryEditFields
            entry={selectedCarousel}
            token={token}
            onChange={(patch) => value.patchCarousel(selectedCarousel.id, patch)}
            onPromoteToEvento={value.promoteCarouselToEvento}
            onDelete={() => {
              if (window.confirm("¿Quitar del carrusel del home?")) {
                value.deleteCarousel(selectedCarousel.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
      {selectedKind === "photo" && selectedPhotoIndex != null ? (
        <EditPanelChrome
          title="Editar foto de actividades"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <HomePhotoEditFields
            photo={photos[selectedPhotoIndex]}
            token={token}
            onChange={(patch) => value.patchPhoto(selectedPhotoIndex, patch)}
            onDelete={() => {
              if (window.confirm("¿Quitar esta foto del home?")) {
                value.deletePhoto(selectedPhotoIndex);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
      {selectedKind === "hero" ? (
        <EditPanelChrome
          title="Encabezado del inicio"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <AgendaEntryImageField
              label="Foto de fondo del landing"
              site="acropolis"
              image={homeHero.background?.src ?? ""}
              imageAlt={
                homeHero.background?.alt ??
                "Voluntarios de Nueva Acrópolis en unidad, con chalecos verdes y azules"
              }
              token={token}
              onChange={(patch) =>
                patchHomeHero({
                  background: {
                    src: patch.image ?? homeHero.background?.src ?? "",
                    alt: patch.imageAlt ?? homeHero.background?.alt ?? "",
                  },
                })
              }
            />
            <EditField
              label="Título principal (h1)"
              value={homeHero.h1 ?? ""}
              onChange={(v) => patchHomeHero({ h1: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedKind === "whatIsNa" ? (
        <EditPanelChrome
          title="Bloque — Qué es Nueva Acrópolis"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <AgendaEntryImageField
              label="Imagen lateral"
              site="acropolis"
              image={whatIsNa.imageSrc ?? ""}
              imageAlt={whatIsNa.imageAlt ?? ""}
              token={token}
              onChange={(patch) =>
                patchHomePage({
                  whatIsNa: {
                    ...whatIsNa,
                    ...(patch.image !== undefined
                      ? { imageSrc: patch.image }
                      : {}),
                    ...(patch.imageAlt !== undefined
                      ? { imageAlt: patch.imageAlt }
                      : {}),
                  },
                })
              }
            />
            {(whatIsNa.paragraphs ?? []).map((p, i) => (
              <EditField
                key={i}
                label={`Párrafo ${i + 1}`}
                value={p}
                onChange={(v) => {
                  const next = [...(whatIsNa.paragraphs ?? [])];
                  next[i] = v;
                  patchHomePage({ whatIsNa: { ...whatIsNa, paragraphs: next } });
                }}
                multiline
              />
            ))}
            <EditField
              label="Texto del botón"
              value={whatIsNa.ctaLabel ?? ""}
              onChange={(v) =>
                patchHomePage({
                  whatIsNa: { ...whatIsNa, ctaLabel: v },
                })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedKind === "pillar" && selectedPillar ? (
        <EditPanelChrome
          title={`Pilar — ${selectedPillar.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={selectedPillar.title}
              onChange={(v) => patchPillar(selectedPillar.id, { title: v })}
            />
            <EditField
              label="Eslogan"
              value={selectedPillar.tagline ?? ""}
              onChange={(v) => patchPillar(selectedPillar.id, { tagline: v })}
            />
            <EditField
              label="Texto"
              value={selectedPillar.text ?? ""}
              onChange={(v) => patchPillar(selectedPillar.id, { text: v })}
              multiline
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={selectedPillar.img ?? ""}
              imageAlt={selectedPillar.imgAlt ?? selectedPillar.title}
              token={token}
              onChange={(patch) =>
                patchPillar(selectedPillar.id, {
                  ...(patch.image !== undefined ? { img: patch.image } : {}),
                  ...(patch.imageAlt !== undefined
                    ? { imgAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
            <EditField
              label="Texto del botón"
              value={selectedPillar.cta ?? ""}
              onChange={(v) => patchPillar(selectedPillar.id, { cta: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedKind === "philosophyBand" ? (
        <EditPanelChrome
          title="Banda — Filosofía para Vivir"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <AgendaEntryImageField
              label="Foto de fondo"
              site="acropolis"
              image={philosophyBand.imageSrc ?? ""}
              imageAlt=""
              token={token}
              onChange={(patch) =>
                patchHomePage({
                  philosophyBand: {
                    ...philosophyBand,
                    ...(patch.image !== undefined
                      ? { imageSrc: patch.image }
                      : {}),
                  },
                })
              }
            />
            <EditField
              label="Titular"
              value={philosophyBand.headline ?? ""}
              onChange={(v) =>
                patchHomePage({
                  philosophyBand: { ...philosophyBand, headline: v },
                })
              }
            />
            <EditField
              label="Etiqueta"
              value={philosophyBand.eyebrow ?? ""}
              onChange={(v) =>
                patchHomePage({
                  philosophyBand: { ...philosophyBand, eyebrow: v },
                })
              }
            />
            <EditField
              label="Texto"
              value={philosophyBand.text ?? ""}
              onChange={(v) =>
                patchHomePage({
                  philosophyBand: { ...philosophyBand, text: v },
                })
              }
              multiline
            />
            <EditField
              label="Texto del botón"
              value={philosophyBand.ctaLabel ?? ""}
              onChange={(v) =>
                patchHomePage({
                  philosophyBand: { ...philosophyBand, ctaLabel: v },
                })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedKind === "circuloAmigos" &&
      selectedId === CIRCULO_AMIGOS_SELECTED_ID ? (
        <EditPanelChrome
          title="Círculo de Amigos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <CirculoAmigosEditFields
            value={circuloAmigos}
            token={token}
            onChange={patchCirculoAmigos}
          />
        </EditPanelChrome>
      ) : null}
      {selectedKind === "esferaHome" &&
      selectedId === ESFERA_HOME_PROMO_SECTION_ID ? (
        <EditPanelChrome
          title="Esfera en el inicio"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <EsferaHomeEditFields
            value={esferaHomePromo}
            logo={esferaLogo}
            token={token}
            onChange={patchEsferaHomePromo}
            onLogoChange={patchEsferaLogo}
          />
        </EditPanelChrome>
      ) : null}
    </HomeCmsEditContext.Provider>
  );
}

function HomePhotoEditFields({
  photo,
  token,
  onChange,
  onDelete,
}: {
  photo: CmsActivityPhoto;
  token: string | null;
  onChange: (patch: Partial<CmsActivityPhoto>) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-4">
      <AgendaEntryImageField
        image={photo.src}
        imageAlt={photo.alt}
        token={token}
        onChange={(patch) => {
          if (patch.image !== undefined) onChange({ src: patch.image });
          if (patch.imageAlt !== undefined) onChange({ alt: patch.imageAlt });
        }}
      />
      <EditField label="Pie de foto" value={photo.caption ?? ""} onChange={(v) => onChange({ caption: v })} />
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
        >
          Quitar foto del home
        </button>
      ) : null}
    </div>
  );
}

export function HomeCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  const activeEdit =
    editMode === "1" ||
    (typeof window !== "undefined" &&
      isInEditorIframe() &&
      readStoredCmsEditMode() === "1");
  if (!activeEdit) return <>{children}</>;
  return <HomeCmsEditInner>{children}</HomeCmsEditInner>;
}

export function HomeActivityPhotosSection() {
  const edit = useHomeCmsEdit();
  const photos = useCmsActivityPhotos();

  const list = edit?.ready
    ? edit.photos
    : photos.slice(0, HOME_ACTIVITY_PHOTOS_LIMIT);

  return (
    <section
      id="home-fotos"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-sand/60 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-na-heketDark sm:text-3xl">
              Fotos de nuestras actividades
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-na-muted sm:mx-0 sm:text-base">
              Actividades abiertas al público — filosofía, cultura y voluntariado en
              acción en República Dominicana.
              {edit?.ready ? (
                <span className="mt-1 block text-xs font-semibold text-amber-800">
                  Clic en el lápiz de cada foto para cambiar imagen, texto o quitarla.
                </span>
              ) : null}
            </p>
          </div>
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.addPhoto()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir foto
            </button>
          ) : null}
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {list.map((photo, index) => {
            const src = resolveCmsMediaUrl(photo.src) ?? photo.src;
            return (
              <li
                key={`${photo.src}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-na-heket/5 sm:rounded-xl"
              >
                {edit?.ready ? (
                  <button
                    type="button"
                    onClick={() => edit.setSelected("photo", String(index))}
                    className="absolute right-2 top-2 z-10 rounded-full bg-na-helios p-1.5 text-na-ink shadow"
                    aria-label="Editar foto"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                ) : null}
                {src ? (
                <Image
                  src={src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                  unoptimized
                />
                ) : edit?.ready ? (
                  <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                    Sin imagen — clic en lápiz
                  </div>
                ) : null}
                {photo.caption ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-na-heketDark/80 to-transparent px-2 py-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 sm:px-3 sm:py-2.5 sm:text-xs">
                    {photo.caption}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
