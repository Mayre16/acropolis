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
import {
  DEFAULT_ESFERA_PAGE,
  mergeEsferaPage,
  hideEsferaListItem,
  newEsferaAlianzaId,
  newEsferaAudienciaId,
  newEsferaBeneficioId,
  newEsferaGallerySlideId,
  newEsferaModalidadId,
  newEsferaPrincipioId,
  newEsferaTrainingId,
  newEsferaWorkshopId,
} from "@/lib/cms/esfera-page-edit";
import {
  fetchCmsDraft,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import {
  DEFAULT_COLLABORATE_BLOCK,
  mergeCollaborateBlock,
} from "@/lib/cms/collaborate-content";
import { CollaborateCmsPanels } from "@/components/cms/CollaborateCmsPanels";
import { EsferaExtraCmsPanels } from "@/components/cms/EsferaExtraCmsPanels";
import type {
  CmsDocument,
  CmsCollaborateBlock,
  CmsCollaborateTab,
  CmsEsferaAlianza,
  CmsEsferaAudiencia,
  CmsEsferaBeneficio,
  CmsEsferaGallerySlide,
  CmsEsferaImpactStat,
  CmsEsferaModalidad,
  CmsEsferaPage,
  CmsEsferaPrincipio,
  CmsEsferaQuienesPoint,
  CmsEsferaQuienesTab,
  CmsEsferaTrainingItem,
  CmsEsferaWorkshopLine,
  EsferaListKey,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import { EsferaLogoEditFields } from "@/components/cms/EsferaLogoEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";

type EsferaCmsEditContextValue = {
  ready: boolean;
  page: CmsEsferaPage;
  collaborate: CmsCollaborateBlock;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchTraining: (id: string, patch: Partial<CmsEsferaTrainingItem>) => void;
  patchPage: (patch: Partial<CmsEsferaPage>) => void;
  patchCollaborate: (patch: Partial<CmsCollaborateBlock>) => void;
  patchCollaborateTab: (id: string, patch: Partial<CmsCollaborateTab>) => void;
  patchWorkshopLine: (id: string, patch: Partial<CmsEsferaWorkshopLine>) => void;
  patchAlianza: (id: string, patch: Partial<CmsEsferaAlianza>) => void;
  patchBeneficio: (id: string, patch: Partial<CmsEsferaBeneficio>) => void;
  patchAudiencia: (id: string, patch: Partial<CmsEsferaAudiencia>) => void;
  patchModalidad: (id: string, patch: Partial<CmsEsferaModalidad>) => void;
  patchPrincipio: (id: string, patch: Partial<CmsEsferaPrincipio>) => void;
  patchQuienesTab: (id: string, patch: Partial<CmsEsferaQuienesTab>) => void;
  patchQuienesPoint: (
    tabId: string,
    pointId: string,
    patch: Partial<CmsEsferaQuienesPoint>,
  ) => void;
  patchImpactStat: (id: string, patch: Partial<CmsEsferaImpactStat>) => void;
  patchImpactGallerySlide: (
    id: string,
    patch: Partial<CmsEsferaGallerySlide>,
  ) => void;
  addTraining: () => void;
  addWorkshopLine: () => void;
  addAlianza: () => void;
  addBeneficio: () => void;
  addAudiencia: () => void;
  addModalidad: () => void;
  addPrincipio: () => void;
  addImpactGallerySlide: () => void;
  deleteTraining: (id: string) => void;
  deleteWorkshopLine: (id: string) => void;
  deleteAlianza: (id: string) => void;
  deleteBeneficio: (id: string) => void;
  deleteAudiencia: (id: string) => void;
  deleteModalidad: (id: string) => void;
  deletePrincipio: (id: string) => void;
  deleteImpactGallerySlide: (id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const EsferaCmsEditContext = createContext<EsferaCmsEditContextValue | null>(
  null,
);

export function useEsferaCmsEdit() {
  return useContext(EsferaCmsEditContext);
}

function buildDoc(
  base: CmsDocument,
  page: CmsEsferaPage,
  collaborate: CmsCollaborateBlock,
): CmsDocument {
  return mergeHeroCarouselsIntoDoc({
    ...base,
    sections: { ...base.sections, esferaPage: page, collaborateBlock: collaborate },
  });
}

function EsferaCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<CmsEsferaPage>(DEFAULT_ESFERA_PAGE);
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
    setPage(mergeEsferaPage(draft.sections.esferaPage));
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
      await saveCmsDraft("acropolis", token, buildDoc(latest, page, collaborate));
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
  }, [token, page, collaborate]);

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

  const patchTraining = useCallback(
    (id: string, patch: Partial<CmsEsferaTrainingItem>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          trainings: (merged.trainings ?? []).map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchPage = useCallback(
    (patch: Partial<CmsEsferaPage>) => {
      setPage((p) => mergeEsferaPage({ ...p, ...patch }));
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

  const addTraining = useCallback(() => {
    const item: CmsEsferaTrainingItem = {
      id: newEsferaTrainingId(),
      title: "Nuevo entrenamiento",
      date: "Por anunciar",
      startsAt: "",
      time: "",
      sede: "",
      blurb: "",
      imageSrc: "",
      imageAlt: "Nuevo entrenamiento Esfera",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        trainings: [...(merged.trainings ?? []), item],
      };
    });
    setSelectedId(item.id);
    markDirty();
  }, [markDirty]);

  const hideEsferaItem = useCallback(
    (listKey: EsferaListKey, id: string) => {
      setPage((p) => hideEsferaListItem(p, listKey, id));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const deleteTraining = useCallback(
    (id: string) => hideEsferaItem("trainings", id),
    [hideEsferaItem],
  );

  const patchWorkshopLine = useCallback(
    (id: string, patch: Partial<CmsEsferaWorkshopLine>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          workshopLines: (merged.workshopLines ?? []).map((w) =>
            w.id === id ? { ...w, ...patch } : w,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchAlianza = useCallback(
    (id: string, patch: Partial<CmsEsferaAlianza>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          alianzas: (merged.alianzas ?? []).map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addWorkshopLine = useCallback(() => {
    const item: CmsEsferaWorkshopLine = {
      id: newEsferaWorkshopId(),
      src: "",
      alt: "Nueva línea formativa Esfera",
      title: "Nueva línea formativa",
      text: "",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        workshopLines: [...(merged.workshopLines ?? []), item],
      };
    });
    setSelectedId(`esfera-workshop:${item.id}`);
    markDirty();
  }, [markDirty]);

  const addAlianza = useCallback(() => {
    const item: CmsEsferaAlianza = {
      id: newEsferaAlianzaId(),
      name: "Nueva alianza",
      logo: "",
      logoAlt: "Logo de la institución aliada",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        alianzas: [...(merged.alianzas ?? []), item],
      };
    });
    setSelectedId(`esfera-alianza:${item.id}`);
    markDirty();
  }, [markDirty]);

  const deleteWorkshopLine = useCallback(
    (id: string) => hideEsferaItem("workshopLines", id),
    [hideEsferaItem],
  );

  const deleteAlianza = useCallback(
    (id: string) => hideEsferaItem("alianzas", id),
    [hideEsferaItem],
  );

  const patchImpactStat = useCallback(
    (id: string, patch: Partial<CmsEsferaImpactStat>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          impactStats: (merged.impactStats ?? []).map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchImpactGallerySlide = useCallback(
    (id: string, patch: Partial<CmsEsferaGallerySlide>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          impactGallery: (merged.impactGallery ?? []).map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addImpactGallerySlide = useCallback(() => {
    const item: CmsEsferaGallerySlide = {
      id: newEsferaGallerySlideId(),
      src: "",
      alt: "Momento de taller Esfera",
      caption: "",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        impactGallery: [...(merged.impactGallery ?? []), item],
      };
    });
    setSelectedId(`esfera-impact-gallery:${item.id}`);
    markDirty();
  }, [markDirty]);

  const deleteImpactGallerySlide = useCallback(
    (id: string) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          impactGallery: (merged.impactGallery ?? []).filter((s) => s.id !== id),
        };
      });
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const patchBeneficio = useCallback(
    (id: string, patch: Partial<CmsEsferaBeneficio>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          beneficios: (merged.beneficios ?? []).map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addBeneficio = useCallback(() => {
    const item: CmsEsferaBeneficio = {
      id: newEsferaBeneficioId(),
      title: "Nuevo beneficio",
      text: "",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        beneficios: [...(merged.beneficios ?? []), item],
      };
    });
    setSelectedId(`esfera-beneficio:${item.id}`);
    markDirty();
  }, [markDirty]);

  const deleteBeneficio = useCallback(
    (id: string) => hideEsferaItem("beneficios", id),
    [hideEsferaItem],
  );

  const patchAudiencia = useCallback(
    (id: string, patch: Partial<CmsEsferaAudiencia>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          audiencias: (merged.audiencias ?? []).map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addAudiencia = useCallback(() => {
    const item: CmsEsferaAudiencia = {
      id: newEsferaAudienciaId(),
      sector: "Nuevo perfil",
      items: [],
      image: "",
      imageAlt: "Perfil de participante Esfera",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        audiencias: [...(merged.audiencias ?? []), item],
      };
    });
    setSelectedId(`esfera-audiencia:${item.id}`);
    markDirty();
  }, [markDirty]);

  const deleteAudiencia = useCallback(
    (id: string) => hideEsferaItem("audiencias", id),
    [hideEsferaItem],
  );

  const patchModalidad = useCallback(
    (id: string, patch: Partial<CmsEsferaModalidad>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          modalidades: (merged.modalidades ?? []).map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addModalidad = useCallback(() => {
    const item: CmsEsferaModalidad = {
      id: newEsferaModalidadId(),
      title: "Nuevo taller",
      duration: "",
      format: "Presencial",
      intro: "",
      topics: [],
      image: "",
      imageAlt: "Taller Esfera",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        modalidades: [...(merged.modalidades ?? []), item],
      };
    });
    setSelectedId(`esfera-modalidad:${item.id}`);
    markDirty();
  }, [markDirty]);

  const deleteModalidad = useCallback(
    (id: string) => hideEsferaItem("modalidades", id),
    [hideEsferaItem],
  );

  const patchPrincipio = useCallback(
    (id: string, patch: Partial<CmsEsferaPrincipio>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          principios: (merged.principios ?? []).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchQuienesTab = useCallback(
    (id: string, patch: Partial<CmsEsferaQuienesTab>) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          quienesTabs: (merged.quienesTabs ?? []).map((tab) =>
            tab.id === id ? { ...tab, ...patch } : tab,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchQuienesPoint = useCallback(
    (
      tabId: string,
      pointId: string,
      patch: Partial<CmsEsferaQuienesPoint>,
    ) => {
      setPage((p) => {
        const merged = mergeEsferaPage(p);
        return {
          ...merged,
          quienesTabs: (merged.quienesTabs ?? []).map((tab) =>
            tab.id === tabId
              ? {
                  ...tab,
                  points: tab.points.map((point) =>
                    point.id === pointId ? { ...point, ...patch } : point,
                  ),
                }
              : tab,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addPrincipio = useCallback(() => {
    const item: CmsEsferaPrincipio = {
      id: newEsferaPrincipioId(),
      src: "",
      alt: "Principio Esfera",
      title: "Nuevo principio",
      text: "",
    };
    setPage((p) => {
      const merged = mergeEsferaPage(p);
      return {
        ...merged,
        principios: [...(merged.principios ?? []), item],
      };
    });
    setSelectedId(`esfera-principio:${item.id}`);
    markDirty();
  }, [markDirty]);

  const deletePrincipio = useCallback(
    (id: string) => hideEsferaItem("principios", id),
    [hideEsferaItem],
  );

  const value = useMemo(
    (): EsferaCmsEditContextValue => ({
      ready,
      page,
      collaborate,
      selectedId,
      setSelectedId,
      patchTraining,
      patchPage,
      patchCollaborate,
      patchCollaborateTab,
      patchWorkshopLine,
      patchAlianza,
      patchBeneficio,
      patchAudiencia,
      patchModalidad,
      patchPrincipio,
      patchQuienesTab,
      patchQuienesPoint,
      patchImpactStat,
      patchImpactGallerySlide,
      addTraining,
      addWorkshopLine,
      addAlianza,
      addBeneficio,
      addAudiencia,
      addModalidad,
      addPrincipio,
      addImpactGallerySlide,
      deleteTraining,
      deleteWorkshopLine,
      deleteAlianza,
      deleteBeneficio,
      deleteAudiencia,
      deleteModalidad,
      deletePrincipio,
      deleteImpactGallerySlide,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      page,
      collaborate,
      selectedId,
      patchTraining,
      patchPage,
      patchCollaborate,
      patchCollaborateTab,
      patchWorkshopLine,
      patchAlianza,
      patchBeneficio,
      patchAudiencia,
      patchModalidad,
      patchPrincipio,
      patchQuienesTab,
      patchQuienesPoint,
      patchImpactStat,
      patchImpactGallerySlide,
      addTraining,
      addWorkshopLine,
      addAlianza,
      addBeneficio,
      addAudiencia,
      addModalidad,
      addPrincipio,
      addImpactGallerySlide,
      deleteTraining,
      deleteWorkshopLine,
      deleteAlianza,
      deleteBeneficio,
      deleteAudiencia,
      deleteModalidad,
      deletePrincipio,
      deleteImpactGallerySlide,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected = (page.trainings ?? []).find((t) => t.id === selectedId);

  return (
    <EsferaCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Esfera — página"
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
              label="Etiqueta"
              value={page.agendaEyebrow ?? ""}
              onChange={(v) => patchPage({ agendaEyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.agendaTitle ?? ""}
              onChange={(v) => patchPage({ agendaTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.agendaIntro ?? ""}
              onChange={(v) => patchPage({ agendaIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selected ? (
        <EditPanelChrome
          title={`Editar — ${selected.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={selected.title}
              onChange={(v) => patchTraining(selected.id, { title: v })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Fecha de inicio (ISO, YYYY-MM-DD)"
                value={selected.startsAt ?? ""}
                onChange={(v) => patchTraining(selected.id, { startsAt: v })}
              />
              <EditField
                label="Fecha visible en la tarjeta"
                value={selected.date}
                onChange={(v) => patchTraining(selected.id, { date: v })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Hora"
                value={selected.time ?? ""}
                onChange={(v) => patchTraining(selected.id, { time: v })}
              />
              <EditField
                label="Ubicación / sede"
                value={selected.sede ?? ""}
                onChange={(v) => patchTraining(selected.id, { sede: v })}
              />
            </div>
            <EditField
              label="Descripción"
              value={selected.blurb}
              onChange={(v) => patchTraining(selected.id, { blurb: v })}
              multiline
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={selected.imageSrc}
              imageAlt={selected.imageAlt}
              token={token}
              onChange={(patch) =>
                patchTraining(selected.id, {
                  ...(patch.image !== undefined
                    ? { imageSrc: patch.image }
                    : {}),
                  ...(patch.imageAlt !== undefined
                    ? { imageAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar este entrenamiento del sitio público?")) {
                  deleteTraining(selected.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
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
          <div className="space-y-4">
            <EsferaLogoEditFields
              page={page}
              token={token}
              onChange={patchPage}
            />
            <HeroEditFields
              value={page}
              onChange={patchPage}
              carouselKey="esfera"
            />
          </div>
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

      <EsferaExtraCmsPanels
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        page={page}
        patchPage={patchPage}
        patchWorkshopLine={patchWorkshopLine}
        patchAlianza={patchAlianza}
        patchBeneficio={patchBeneficio}
        patchAudiencia={patchAudiencia}
        patchModalidad={patchModalidad}
        patchPrincipio={patchPrincipio}
        patchQuienesTab={patchQuienesTab}
        patchQuienesPoint={patchQuienesPoint}
        patchImpactStat={patchImpactStat}
        patchImpactGallerySlide={patchImpactGallerySlide}
        deleteWorkshopLine={deleteWorkshopLine}
        deleteAlianza={deleteAlianza}
        deleteBeneficio={deleteBeneficio}
        deleteAudiencia={deleteAudiencia}
        deleteModalidad={deleteModalidad}
        deletePrincipio={deletePrincipio}
        deleteImpactGallerySlide={deleteImpactGallerySlide}
        dirty={dirty}
        busy={busy}
        status={status}
        onSave={() => void saveDraft()}
        token={token}
      />
    </EsferaCmsEditContext.Provider>
  );
}

export function EsferaCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <EsferaCmsEditInner>{children}</EsferaCmsEditInner>;
}
