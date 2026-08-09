"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ALL_AGENDA_ENTRIES } from "@/lib/agenda-registry";
import {
  getHomeCarouselEntries,
  mergeAgendaEntriesIntoDoc,
  newAgendaId,
} from "@/lib/cms/agenda-edit";
import { ACTIVITY_PHOTOS } from "@/lib/home-content";
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
  uploadCmsImage,
} from "@/lib/cms/api-client";
import {
  normalizeHomeHeroSection,
  patchHomeHeroBackground,
} from "@/lib/cms/home-hero-display";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import type {
  CmsActivityPhoto,
  CmsAgendaEntry,
  CmsCirculoAmigosPromo,
  CmsDocument,
  CmsEsferaHomePromo,
  CmsEvento,
  CmsFraseDelDia,
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
import { EsferaHomeEditFields } from "@/components/cms/EsferaHomeEditFields";
import {
  HomeCmsEditContext,
  type EsferaHomeLogoFields,
  type HomeCmsEditContextValue,
  type HomeSelectedKind,
  useHomeCmsEdit,
} from "@/components/cms/HomeCmsEditHooks";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { isInEditorIframe, readStoredCmsEditMode } from "@/lib/cms/edit-mode";
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { appendEventoDraftsToDoc } from "@/lib/cms/content-edit";
import { promoteAgendaEntryLocally } from "@/lib/agenda-evento";
import { registerCmsEditInit } from "@/lib/cms/edit-session";

export type { HomeCmsEditContextValue, HomeSelectedKind };
export { useHomeCmsEdit };

function newFraseId() {
  return `frase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function HomeCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [carousel, setCarousel] = useState<CmsAgendaEntry[]>([]);
  const [photos, setPhotos] = useState<CmsActivityPhoto[]>([]);
  const [frases, setFrases] = useState<CmsFraseDelDia[]>([]);
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
    setFrases(
      (draft.sections.frasesDelDia ?? []).map((f) => ({
        id: f.id || newFraseId(),
        src: f.src ?? "",
        alt: f.alt ?? "Frase del día",
        caption: f.caption,
      })),
    );
    setHidden(draft.sections.agendaHidden ?? []);
    setHomeHero(normalizeHomeHeroSection(draft.sections.homeHero ?? {}));
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
          frasesDelDia: frases,
          homeHero: normalizeHomeHeroSection(homeHero),
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
    [carousel, photos, frases, hidden, eventoDrafts, homeHero, homePage, circuloAmigos, esferaHomePromo, esferaLogo],
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

  const draftLoadTokenRef = useRef<string | null>(null);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      if (draftLoadTokenRef.current === initToken) {
        postToEditor({ type: "cms-ready" });
        return;
      }
      draftLoadTokenRef.current = initToken;
      setToken(initToken);
      fetchCmsDraft("acropolis")
        .then((draft) => {
          applyLoadedDoc(draft);
          setDraftLoaded(true);
          postToEditor({ type: "cms-ready" });
        })
        .catch((e) => {
          const text = `No se pudo cargar el borrador. ${String(e)}`;
          setStatus(text);
          postToEditor({ type: "cms-status", text, ok: false });
        });
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
      clearBackground?: boolean;
    }) => {
      setHomeHero((h) => {
        if (patch.clearBackground) {
          const { background: _removed, ...rest } = h;
          const { clearBackground: _flag, ...fields } = patch;
          return { ...rest, ...fields };
        }
        return { ...h, ...patch };
      });
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

  const addFrasesFromFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!token) {
        window.alert("Inicia sesión en el editor para subir fotos.");
        return;
      }
      const list = Array.from(files);
      if (list.length === 0) return;

      const created: CmsFraseDelDia[] = [];
      const errors: string[] = [];
      for (const file of list) {
        try {
          const url = await uploadCmsImage("acropolis", token, file, "fraseDelDia");
          created.push({
            id: newFraseId(),
            src: url,
            alt: "Frase del día",
            caption: "",
          });
        } catch (e) {
          errors.push(`${file.name}: ${String(e)}`);
        }
      }

      if (created.length > 0) {
        setFrases((prev) => [...prev, ...created]);
        setSelected("frase", created[created.length - 1]!.id);
        markDirty();
      }

      if (errors.length > 0) {
        const head = errors.slice(0, 5).join("\n");
        const more =
          errors.length > 5 ? `\n…y ${errors.length - 5} más.` : "";
        window.alert(
          created.length > 0
            ? `Se añadieron ${created.length} foto(s). Fallaron ${errors.length}:\n${head}${more}`
            : `No se pudo subir ninguna foto:\n${head}${more}`,
        );
      }
    },
    [token, markDirty, setSelected],
  );

  const value = useMemo(
    (): HomeCmsEditContextValue => ({
      ready,
      carousel,
      photos,
      frases,
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
      patchFrase: (id, patch) => {
        setFrases((list) =>
          list.map((f) => (f.id === id ? { ...f, ...patch } : f)),
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
      addFrase: () => {
        const frase: CmsFraseDelDia = {
          id: newFraseId(),
          src: "",
          alt: "Frase del día",
          caption: "",
        };
        setFrases((list) => [...list, frase]);
        setSelected("frase", frase.id);
        markDirty();
      },
      addFrasesFromFiles,
      setFraseAtIndex: (index: number, src: string) => {
        setFrases((list) => {
          const next = [...list];
          while (next.length <= index) {
            next.push({
              id: newFraseId(),
              src: "",
              alt: "Frase del día",
              caption: "",
            });
          }
          next[index] = {
            ...next[index],
            id: next[index]?.id || newFraseId(),
            src,
            alt: next[index]?.alt || "Frase del día",
          };
          return next;
        });
        markDirty();
      },
      deletePhoto: (index) => {
        setPhotos((list) => list.filter((_, i) => i !== index));
        setSelected(null, null);
        markDirty();
      },
      deleteFrase: (id) => {
        setFrases((list) => list.filter((f) => f.id !== id));
        setSelected(null, null);
        markDirty();
      },
      moveFrase: (id, dir) => {
        setFrases((list) => {
          const i = list.findIndex((f) => f.id === id);
          if (i < 0) return list;
          const j = i + dir;
          if (j < 0 || j >= list.length) return list;
          const next = [...list];
          const [item] = next.splice(i, 1);
          next.splice(j, 0, item);
          return next;
        });
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
      frases,
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
      frases.length,
      addFrasesFromFiles,
    ],
  );

  const selectedCarousel = carousel.find((e) => e.id === selectedId);
  const selectedPhotoIndex =
    selectedKind === "photo" && selectedId != null
      ? Number(selectedId)
      : null;
  const selectedFrase =
    selectedKind === "frase" && selectedId
      ? frases.find((f) => f.id === selectedId)
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
        <div
          data-cms-edit-connecting
          className="bg-amber-50 py-3 text-center text-sm text-na-muted"
        >
          {status || "Conectando con el editor…"}
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
      {selectedKind === "frase" && selectedFrase ? (
        <EditPanelChrome
          title="Editar frase del día"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <HomeFraseEditFields
            frase={selectedFrase}
            token={token}
            onChange={(patch) => value.patchFrase(selectedFrase.id, patch)}
            onMoveUp={() => value.moveFrase(selectedFrase.id, -1)}
            onMoveDown={() => value.moveFrase(selectedFrase.id, 1)}
            onAddMoreFiles={(files) => value.addFrasesFromFiles(files)}
            onDelete={() => {
              if (window.confirm("¿Quitar esta frase del carrusel?")) {
                value.deleteFrase(selectedFrase.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
      {selectedKind === "frasesGallery" ? (
        <EditPanelChrome
          title="Galería de frases del día"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelected(null, null)}
          onSave={() => void saveDraft()}
        >
          <FrasesGalleryEditFields
            frases={frases}
            token={token}
            onSetFraseAtIndex={value.setFraseAtIndex}
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
              label="Foto de fondo del landing (header)"
              site="acropolis"
              imageSlot="homeHero"
              image={homeHero.background?.src ?? ""}
              imageAlt={
                homeHero.background?.alt ??
                "Voluntarios de Nueva Acrópolis en unidad, con chalecos verdes y azules"
              }
              token={token}
              onChange={(patch) => {
                const background = patchHomeHeroBackground(
                  homeHero.background,
                  patch,
                );
                if (background) {
                  patchHomeHero({
                    background: {
                      src: background.src ?? "",
                      alt: background.alt ?? "",
                    },
                  });
                } else {
                  patchHomeHero({ clearBackground: true });
                }
              }}
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

function HomeFraseEditFields({
  frase,
  token,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddMoreFiles,
}: {
  frase: CmsFraseDelDia;
  token: string | null;
  onChange: (patch: Partial<CmsFraseDelDia>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onAddMoreFiles?: (files: FileList | File[]) => Promise<void>;
}) {
  const moreRef = useRef<HTMLInputElement>(null);
  const [addingMore, setAddingMore] = useState(false);

  return (
    <div className="space-y-4">
      <AgendaEntryImageField
        image={frase.src}
        imageAlt={frase.alt}
        token={token}
        imageSlot="fraseDelDia"
        onChange={(patch) => {
          if (patch.image !== undefined) onChange({ src: patch.image });
          if (patch.imageAlt !== undefined) onChange({ alt: patch.imageAlt });
        }}
      />
      <EditField
        label="Texto alternativo"
        value={frase.alt}
        onChange={(v) => onChange({ alt: v })}
      />
      <EditField
        label="Nota interna (opcional)"
        value={frase.caption ?? ""}
        onChange={(v) => onChange({ caption: v })}
      />
      {onAddMoreFiles ? (
        <div className="space-y-1">
          <input
            ref={moreRef}
            type="file"
            accept="image/webp,image/jpeg,image/png,.webp,.jpg,.jpeg,.png"
            multiple
            className="sr-only"
            disabled={addingMore || !token}
            onChange={(e) => {
              const files = e.target.files;
              e.target.value = "";
              if (!files?.length) return;
              setAddingMore(true);
              void onAddMoreFiles(files).finally(() => setAddingMore(false));
            }}
          />
          <button
            type="button"
            disabled={addingMore || !token}
            onClick={() => moreRef.current?.click()}
            className="w-full rounded-lg border border-na-heket/20 py-2 text-sm font-semibold text-na-heketDark disabled:opacity-60"
          >
            {addingMore ? "Subiendo…" : "Añadir más fotos al carrusel"}
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onMoveUp}
          className="flex-1 rounded-lg border border-na-heket/20 py-2 text-sm font-semibold text-na-heketDark"
        >
          ← Antes
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          className="flex-1 rounded-lg border border-na-heket/20 py-2 text-sm font-semibold text-na-heketDark"
        >
          Después →
        </button>
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
        >
          Quitar del carrusel
        </button>
      ) : null}
    </div>
  );
}

const DIAS_SEMANA_GALLERY = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo (próx.)",
] as const;

function FrasesGalleryEditFields({
  frases,
  token,
  onSetFraseAtIndex,
}: {
  frases: CmsFraseDelDia[];
  token: string | null;
  onSetFraseAtIndex: (index: number, src: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-amber-800">
        Sube una foto para cada día de la semana. WebP, máximo 1080×1350 px.
      </p>
      {DIAS_SEMANA_GALLERY.map((dayName, i) => (
        <FraseGalleryDayRow
          key={i}
          dayIndex={i}
          dayName={dayName}
          frase={frases[i] ?? null}
          token={token}
          onUploaded={(url) => onSetFraseAtIndex(i, url)}
          onDelete={() => onSetFraseAtIndex(i, "")}
        />
      ))}
    </div>
  );
}

function FraseGalleryDayRow({
  dayIndex,
  dayName,
  frase,
  token,
  onUploaded,
  onDelete,
}: {
  dayIndex: number;
  dayName: string;
  frase: CmsFraseDelDia | null;
  token: string | null;
  onUploaded: (url: string) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const src = frase?.src ? (resolveCmsMediaUrl(frase.src) ?? frase.src) : "";

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file, "fraseDelDia");
      onUploaded(url);
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/webp,.webp"
        className="sr-only"
        disabled={uploading || !token}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f);
          e.target.value = "";
        }}
      />
      <div className="w-16 shrink-0">
        {src ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={frase?.alt || dayName}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center rounded bg-slate-100 text-slate-400">
            <span className="text-lg">📷</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-na-heketDark">{dayName}</p>
        <p className="text-xs text-slate-500">
          {src ? "Foto cargada" : "Sin foto"}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !token}
          className="rounded-lg bg-na-heket px-3 py-1.5 text-xs font-semibold text-white hover:bg-na-heketDark disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : src ? "Cambiar" : "Subir"}
        </button>
        {src && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-200 bg-white px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            title="Eliminar"
          >
            ✕
          </button>
        )}
      </div>
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
