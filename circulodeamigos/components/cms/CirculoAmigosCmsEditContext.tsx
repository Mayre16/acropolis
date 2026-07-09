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
  CIRCULO_CARD_PLACEHOLDER_IMAGE,
  DEFAULT_CIRCULO_AMIGOS_PAGE,
  circuloCardSelectedId,
  mergeCirculoAmigosPage,
  newCirculoCardId,
  parseCirculoCardSelectedId,
} from "@/lib/cms/circulo-amigos-page-edit";
import {
  fetchCmsDraft,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import type {
  CmsCirculoAmigosCard,
  CmsCirculoAmigosPage,
  CmsCirculoAmigosPaso,
  CmsDocument,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
} from "@/components/cms/CmsEditFields";
import { CirculoImageField } from "@/components/cms/CirculoImageField";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";

type CirculoAmigosCmsEditContextValue = {
  ready: boolean;
  page: CmsCirculoAmigosPage;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchPage: (patch: Partial<CmsCirculoAmigosPage>) => void;
  patchPilar: (id: string, patch: Partial<CmsCirculoAmigosCard>) => void;
  patchBeneficio: (id: string, patch: Partial<CmsCirculoAmigosCard>) => void;
  patchPaso: (id: string, patch: Partial<CmsCirculoAmigosPaso>) => void;
  addPilar: () => void;
  addBeneficio: () => void;
  addPaso: () => void;
  deletePilar: (id: string) => void;
  deleteBeneficio: (id: string) => void;
  deletePaso: (id: string) => void;
  addRecibeItem: () => void;
  removeRecibeItem: (index: number) => void;
  addEsperamosItem: () => void;
  removeEsperamosItem: (index: number) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const CirculoAmigosCmsEditContext =
  createContext<CirculoAmigosCmsEditContextValue | null>(null);

export function useCirculoAmigosCmsEdit() {
  return useContext(CirculoAmigosCmsEditContext);
}

function buildDoc(base: CmsDocument, page: CmsCirculoAmigosPage): CmsDocument {
  return {
    ...base,
    site: "circulodeamigos",
    sections: { ...base.sections, circuloAmigosPage: page },
  };
}

function CirculoAmigosCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<CmsCirculoAmigosPage>(DEFAULT_CIRCULO_AMIGOS_PAGE);
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
    setPage(mergeCirculoAmigosPage(draft.sections.circuloAmigosPage));
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("circulodeamigos");
      await saveCmsDraft("circulodeamigos", token, buildDoc(latest, page));
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
  }, [token, page]);

  const publish = useCallback(async () => {
    await runCoordinatedCmsPublish();
  }, []);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      setToken(initToken);
      fetchCmsDraft("circulodeamigos")
        .then((draft) => {
          applyLoadedDoc(draft);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "circulodeamigos");
  }, [applyLoadedDoc]);

  useCmsEditBridge(saveDraft);

  const patchPage = useCallback(
    (patch: Partial<CmsCirculoAmigosPage>) => {
      setPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchPilar = useCallback(
    (id: string, patch: Partial<CmsCirculoAmigosCard>) => {
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          pilares: (merged.pilares ?? []).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchBeneficio = useCallback(
    (id: string, patch: Partial<CmsCirculoAmigosCard>) => {
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          beneficios: (merged.beneficios ?? []).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchPaso = useCallback(
    (id: string, patch: Partial<CmsCirculoAmigosPaso>) => {
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          pasos: (merged.pasos ?? []).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addPilar = useCallback(() => {
    const item: CmsCirculoAmigosCard = {
      id: newCirculoCardId("pilar"),
      title: "Nuevo pilar",
      text: "",
      imageSrc: CIRCULO_CARD_PLACEHOLDER_IMAGE,
      imageAlt: "Imagen del pilar",
    };
    setPage((p) => {
      const merged = mergeCirculoAmigosPage(p);
      return { ...merged, pilares: [...(merged.pilares ?? []), item] };
    });
    setSelectedId(circuloCardSelectedId("pilar", item.id));
    markDirty();
  }, [markDirty]);

  const addBeneficio = useCallback(() => {
    const item: CmsCirculoAmigosCard = {
      id: newCirculoCardId("beneficio"),
      title: "Nuevo beneficio",
      text: "",
      imageSrc: CIRCULO_CARD_PLACEHOLDER_IMAGE,
      imageAlt: "Imagen del beneficio",
    };
    setPage((p) => {
      const merged = mergeCirculoAmigosPage(p);
      return { ...merged, beneficios: [...(merged.beneficios ?? []), item] };
    });
    setSelectedId(circuloCardSelectedId("beneficio", item.id));
    markDirty();
  }, [markDirty]);

  const addPaso = useCallback(() => {
    const id = newCirculoCardId("paso");
    setPage((p) => {
      const m = mergeCirculoAmigosPage(p);
      const n = (m.pasos?.length ?? 0) + 1;
      const item: CmsCirculoAmigosPaso = {
        id,
        n,
        title: `Paso ${n}`,
        text: "",
        imageSrc: CIRCULO_CARD_PLACEHOLDER_IMAGE,
        imageAlt: `Paso ${n}`,
      };
      return { ...m, pasos: [...(m.pasos ?? []), item] };
    });
    setSelectedId(circuloCardSelectedId("paso", id));
    markDirty();
  }, [markDirty]);

  const deletePilar = useCallback(
    (id: string) => {
      if (!window.confirm("¿Eliminar esta tarjeta de pilares?")) return;
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          pilares: (merged.pilares ?? []).filter((item) => item.id !== id),
        };
      });
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const deleteBeneficio = useCallback(
    (id: string) => {
      if (!window.confirm("¿Eliminar esta tarjeta de beneficios?")) return;
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          beneficios: (merged.beneficios ?? []).filter((item) => item.id !== id),
        };
      });
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const deletePaso = useCallback(
    (id: string) => {
      if (!window.confirm("¿Eliminar este paso?")) return;
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          pasos: (merged.pasos ?? [])
            .filter((item) => item.id !== id)
            .map((item, i) => ({ ...item, n: i + 1 })),
        };
      });
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const addRecibeItem = useCallback(() => {
    setPage((p) => {
      const merged = mergeCirculoAmigosPage(p);
      return {
        ...merged,
        recibesItems: [...(merged.recibesItems ?? []), "Nuevo ítem"],
      };
    });
    markDirty();
  }, [markDirty]);

  const removeRecibeItem = useCallback(
    (index: number) => {
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          recibesItems: (merged.recibesItems ?? []).filter((_, i) => i !== index),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addEsperamosItem = useCallback(() => {
    setPage((p) => {
      const merged = mergeCirculoAmigosPage(p);
      return {
        ...merged,
        esperamosItems: [...(merged.esperamosItems ?? []), "Nuevo ítem"],
      };
    });
    markDirty();
  }, [markDirty]);

  const removeEsperamosItem = useCallback(
    (index: number) => {
      setPage((p) => {
        const merged = mergeCirculoAmigosPage(p);
        return {
          ...merged,
          esperamosItems: (merged.esperamosItems ?? []).filter((_, i) => i !== index),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const cardSelection = parseCirculoCardSelectedId(selectedId);
  const selectedCard =
    cardSelection?.kind === "pilar"
      ? mergeCirculoAmigosPage(page).pilares?.find((c) => c.id === cardSelection.id)
      : cardSelection?.kind === "beneficio"
        ? mergeCirculoAmigosPage(page).beneficios?.find(
            (c) => c.id === cardSelection.id,
          )
        : cardSelection?.kind === "paso"
          ? mergeCirculoAmigosPage(page).pasos?.find((c) => c.id === cardSelection.id)
          : null;

  const value = useMemo(
    (): CirculoAmigosCmsEditContextValue => ({
      ready,
      page,
      selectedId,
      setSelectedId,
      patchPage,
      patchPilar,
      patchBeneficio,
      patchPaso,
      addPilar,
      addBeneficio,
      addPaso,
      deletePilar,
      deleteBeneficio,
      deletePaso,
      addRecibeItem,
      removeRecibeItem,
      addEsperamosItem,
      removeEsperamosItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      page,
      selectedId,
      patchPage,
      patchPilar,
      patchBeneficio,
      patchPaso,
      addPilar,
      addBeneficio,
      addPaso,
      deletePilar,
      deleteBeneficio,
      deletePaso,
      addRecibeItem,
      removeRecibeItem,
      addEsperamosItem,
      removeEsperamosItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  return (
    <CirculoAmigosCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Círculo de Amigos — contenido editable"
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

      {selectedId === "__hero__" ? (
        <EditPanelChrome
          title="Encabezado"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={page.heroEyebrow ?? ""}
              onChange={(v) => patchPage({ heroEyebrow: v })}
            />
            <EditField
              label="Título principal (h1)"
              value={page.heroTitle ?? ""}
              onChange={(v) => patchPage({ heroTitle: v })}
              multiline
            />
            <EditField
              label="Subtítulo (h2)"
              value={page.heroSubtitle ?? ""}
              onChange={(v) => patchPage({ heroSubtitle: v })}
              multiline
            />
            <EditField
              label="Texto de apoyo (h3)"
              value={page.heroLede ?? ""}
              onChange={(v) => patchPage({ heroLede: v })}
              multiline
            />
            <CirculoImageField
              label="Foto lateral del hero"
              image={page.heroImageSrc ?? ""}
              imageAlt={page.heroImageAlt ?? ""}
              token={token}
              onChange={(patch) =>
                patchPage({
                  ...(patch.image !== undefined ? { heroImageSrc: patch.image } : {}),
                  ...(patch.imageAlt !== undefined
                    ? { heroImageAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-intro__" ? (
        <EditPanelChrome
          title="¿Qué es el Círculo de Amigos?"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={page.introEyebrow ?? ""}
              onChange={(v) => patchPage({ introEyebrow: v })}
            />
            {(mergeCirculoAmigosPage(page).introParagraphs ?? []).map((p, i) => (
              <EditField
                key={`intro-${i}`}
                label={`Párrafo ${i + 1}`}
                value={p}
                onChange={(v) => {
                  const merged = mergeCirculoAmigosPage(page);
                  const next = [...(merged.introParagraphs ?? [])];
                  next[i] = v;
                  patchPage({ introParagraphs: next });
                }}
                multiline
              />
            ))}
            <button
              type="button"
              onClick={() => {
                const merged = mergeCirculoAmigosPage(page);
                patchPage({
                  introParagraphs: [...(merged.introParagraphs ?? []), ""],
                });
              }}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Añadir párrafo
            </button>
            <CirculoImageField
              label="Foto de la sección"
              image={page.introBannerSrc ?? ""}
              imageAlt={page.introBannerAlt ?? ""}
              token={token}
              onChange={(patch) =>
                patchPage({
                  ...(patch.image !== undefined ? { introBannerSrc: patch.image } : {}),
                  ...(patch.imageAlt !== undefined
                    ? { introBannerAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-pilares__" ? (
        <EditPanelChrome
          title="Pilares"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título de sección"
              value={page.pilaresTitle ?? ""}
              onChange={(v) => patchPage({ pilaresTitle: v })}
            />
            <button
              type="button"
              onClick={addPilar}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Añadir tarjeta
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-beneficios__" ? (
        <EditPanelChrome
          title="Beneficios"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título de sección"
              value={page.beneficiosTitle ?? ""}
              onChange={(v) => patchPage({ beneficiosTitle: v })}
            />
            <button
              type="button"
              onClick={addBeneficio}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Añadir tarjeta
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-pasos__" ? (
        <EditPanelChrome
          title="Pasos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título de sección"
              value={page.pasosTitle ?? ""}
              onChange={(v) => patchPage({ pasosTitle: v })}
            />
            <button
              type="button"
              onClick={addPaso}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Añadir paso
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-recibes__" ? (
        <EditPanelChrome
          title="Lo que recibirás"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={page.recibesTitle ?? ""}
              onChange={(v) => patchPage({ recibesTitle: v })}
            />
            {(mergeCirculoAmigosPage(page).recibesItems ?? []).map((item, i) => (
              <div key={`recibe-${i}`} className="space-y-2">
                <EditField
                  label={`Ítem ${i + 1}`}
                  value={item}
                  onChange={(v) => {
                    const merged = mergeCirculoAmigosPage(page);
                    const next = [...(merged.recibesItems ?? [])];
                    next[i] = v;
                    patchPage({ recibesItems: next });
                  }}
                  multiline
                />
                <button
                  type="button"
                  onClick={() => removeRecibeItem(i)}
                  className="text-xs font-bold uppercase text-red-600"
                >
                  Eliminar ítem
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRecibeItem}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Añadir ítem
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-esperamos__" ? (
        <EditPanelChrome
          title="Lo que esperamos de ti"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={page.esperamosTitle ?? ""}
              onChange={(v) => patchPage({ esperamosTitle: v })}
            />
            {(mergeCirculoAmigosPage(page).esperamosItems ?? []).map((item, i) => (
              <div key={`espera-${i}`} className="space-y-2">
                <EditField
                  label={`Ítem ${i + 1}`}
                  value={item}
                  onChange={(v) => {
                    const merged = mergeCirculoAmigosPage(page);
                    const next = [...(merged.esperamosItems ?? [])];
                    next[i] = v;
                    patchPage({ esperamosItems: next });
                  }}
                  multiline
                />
                <button
                  type="button"
                  onClick={() => removeEsperamosItem(i)}
                  className="text-xs font-bold uppercase text-red-600"
                >
                  Eliminar ítem
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEsperamosItem}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Añadir ítem
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__circulo-cta__" ? (
        <EditPanelChrome
          title="Llamado final"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={page.ctaTitle ?? ""}
              onChange={(v) => patchPage({ ctaTitle: v })}
            />
            <EditField
              label="Texto"
              value={page.ctaText ?? ""}
              onChange={(v) => patchPage({ ctaText: v })}
              multiline
            />
            <EditField
              label="Correo de contacto"
              value={page.ctaEmail ?? ""}
              onChange={(v) => patchPage({ ctaEmail: v })}
            />
            <EditField
              label="Nota legal"
              value={page.notaLegal ?? ""}
              onChange={(v) => patchPage({ notaLegal: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedCard ? (
        <EditPanelChrome
          title="Editar tarjeta"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={selectedCard.title}
              onChange={(v) => {
                if (cardSelection?.kind === "pilar") patchPilar(cardSelection.id, { title: v });
                else if (cardSelection?.kind === "beneficio")
                  patchBeneficio(cardSelection.id, { title: v });
                else if (cardSelection?.kind === "paso")
                  patchPaso(cardSelection.id, { title: v });
              }}
            />
            <EditField
              label="Texto"
              value={selectedCard.text}
              onChange={(v) => {
                if (cardSelection?.kind === "pilar") patchPilar(cardSelection.id, { text: v });
                else if (cardSelection?.kind === "beneficio")
                  patchBeneficio(cardSelection.id, { text: v });
                else if (cardSelection?.kind === "paso")
                  patchPaso(cardSelection.id, { text: v });
              }}
              multiline
            />
            <CirculoImageField
              label="Imagen"
              image={selectedCard.imageSrc}
              imageAlt={selectedCard.imageAlt}
              token={token}
              onChange={(patch) => {
                const p = {
                  ...(patch.image !== undefined ? { imageSrc: patch.image } : {}),
                  ...(patch.imageAlt !== undefined ? { imageAlt: patch.imageAlt } : {}),
                };
                if (cardSelection?.kind === "pilar") patchPilar(cardSelection.id, p);
                else if (cardSelection?.kind === "beneficio")
                  patchBeneficio(cardSelection.id, p);
                else if (cardSelection?.kind === "paso") patchPaso(cardSelection.id, p);
              }}
            />
            {cardSelection?.kind === "paso" ? (
              <EditField
                label="Número de paso"
                value={String((selectedCard as CmsCirculoAmigosPaso).n ?? "")}
                onChange={(v) => {
                  const n = Number.parseInt(v, 10);
                  if (cardSelection?.kind === "paso" && Number.isFinite(n)) {
                    patchPaso(cardSelection.id, { n });
                  }
                }}
              />
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (!cardSelection) return;
                if (cardSelection.kind === "pilar") deletePilar(cardSelection.id);
                else if (cardSelection.kind === "beneficio")
                  deleteBeneficio(cardSelection.id);
                else if (cardSelection.kind === "paso") deletePaso(cardSelection.id);
              }}
              className="text-xs font-bold uppercase text-red-600"
            >
              Eliminar tarjeta
            </button>
          </div>
        </EditPanelChrome>
      ) : null}
    </CirculoAmigosCmsEditContext.Provider>
  );
}

export function CirculoAmigosCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <CirculoAmigosCmsEditInner>{children}</CirculoAmigosCmsEditInner>;
}
