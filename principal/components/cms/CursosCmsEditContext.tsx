"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CURSOS_PROXIMAS_CONVOCATORIAS } from "@/lib/cursos-agenda";
import { SALONES, type SalonSede } from "@/lib/salones";
import {
  getCursosAgendaEntries,
  mergeCursosAgendaIntoDoc,
  newCursosAgendaId,
} from "@/lib/cms/agenda-edit";
import {
  CONFERENCIAS_DEFAULTS,
  CURSOS_TALLERES_DEFAULTS,
  findOfertaCard,
  getHiddenOfertaCards,
  isCatalogOfertaCard,
  isOfertaCardHidden,
  mergeCursosCards,
  newCursosCardId,
  ofertaSelectedId,
  parseOfertaSelectedId,
} from "@/lib/cms/cursos-oferta-edit";
import {
  fetchCmsDraft,
  resolveCmsMediaUrl,
  saveCmsDraft,
  uploadCmsImage,
} from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import {
  buildDocWithSalones,
  DEFAULT_SALONES_PAGE,
  getSalonesForEdit,
  newSalonId,
  type AddSalonOptions,
} from "@/lib/cms/salones-edit";
import {
  CIRCULO_AMIGOS_SELECTED_ID,
  mergeCirculoAmigos,
} from "@/lib/cms/circulo-amigos-display";
import type {
  CmsAgendaEntry,
  CmsCirculoAmigosPromo,
  CmsCursosCard,
  CmsCursosPage,
  CmsDocument,
  CmsSalon,
  CmsSalonesPage,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
  ImageField,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryEditFields } from "@/components/cms/AgendaEntryEditFields";
import { CirculoAmigosEditFields } from "@/components/cms/CirculoAmigosEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { DEFAULT_OFERTA_COPY, CURSOS_INSCRIBE_SECTION_ID } from "@/lib/cms/cursos-display";

const LAYOUT_OPTIONS = [
  { value: "butacas", label: "Butacas en filas" },
  { value: "mesas", label: "Mesas tipo escuela" },
  { value: "herradura", label: "Disposición herradura" },
] as const;

const DEFAULT_PAGE: CmsCursosPage = {
  proximasTitle: "Próximas convocatorias",
  proximasIntro:
    "Cursos, talleres y conferencias con fecha próxima — la misma agenda que en /agenda. Haz clic para inscribirte o pedir más información.",
  ofertaEyebrow: DEFAULT_OFERTA_COPY.eyebrow,
  ofertaCursosIntro: DEFAULT_OFERTA_COPY.cursosIntro,
  ofertaConferenciasIntro: DEFAULT_OFERTA_COPY.conferenciasIntro,
};

type CursosCmsEditContextValue = {
  ready: boolean;
  page: CmsCursosPage;
  agendaItems: CmsAgendaEntry[];
  salonesItems: CmsSalon[];
  salonesPage: CmsSalonesPage;
  circuloAmigos: CmsCirculoAmigosPromo;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchPage: (patch: Partial<CmsCursosPage>) => void;
  patchAgendaItem: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  addAgendaItem: () => void;
  deleteAgendaItem: (id: string) => void;
  patchOfertaCard: (
    kind: "cursos" | "conf",
    id: string,
    patch: Partial<CmsCursosCard>,
  ) => void;
  addOfertaCard: (kind: "cursos" | "conf") => void;
  deleteOfertaCard: (kind: "cursos" | "conf", id: string) => void;
  patchSalon: (id: string, patch: Partial<CmsSalon>) => void;
  addSalon: (options?: AddSalonOptions) => void;
  hideSalon: (id: string) => void;
  patchSalonesPage: (patch: Partial<CmsSalonesPage>) => void;
  patchCirculoAmigos: (patch: Partial<CmsCirculoAmigosPromo>) => void;
  getOfertaCards: (kind: "cursos" | "conf") => CmsCursosCard[];
  getHiddenOfertaCards: (kind: "cursos" | "conf") => CmsCursosCard[];
  isOfertaCardHidden: (kind: "cursos" | "conf", id: string) => boolean;
  restoreOfertaCard: (kind: "cursos" | "conf", id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const CursosCmsEditContext = createContext<CursosCmsEditContextValue | null>(
  null,
);

export function useCursosCmsEdit() {
  return useContext(CursosCmsEditContext);
}

function buildDoc(
  base: CmsDocument,
  page: CmsCursosPage,
  agendaItems: CmsAgendaEntry[],
  agendaHidden: string[],
  salonesItems: CmsSalon[],
  salonesPage: CmsSalonesPage,
  salonesHidden: string[],
  circuloAmigos: CmsCirculoAmigosPromo,
): CmsDocument {
  const withAgenda = mergeCursosAgendaIntoDoc(base, agendaItems);
  const withSalones = buildDocWithSalones(
    withAgenda,
    salonesItems,
    salonesPage,
    salonesHidden,
  );
  return mergeHeroCarouselsIntoDoc({
    ...withSalones,
    sections: {
      ...withSalones.sections,
      agendaHidden,
      cursosPage: page,
      culturaPage: {
        ...withSalones.sections.culturaPage,
        circuloAmigos,
      },
    },
  });
}

function CursosCmsEditInner({
  children,
  embedded = false,
}: {
  children: ReactNode;
  embedded?: boolean;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<CmsCursosPage>(DEFAULT_PAGE);
  const [agendaItems, setAgendaItems] = useState<CmsAgendaEntry[]>([]);
  const [agendaHidden, setAgendaHidden] = useState<string[]>([]);
  const [salonesItems, setSalonesItems] = useState<CmsSalon[]>([]);
  const [salonesHidden, setSalonesHidden] = useState<string[]>([]);
  const [salonesPage, setSalonesPage] =
    useState<CmsSalonesPage>(DEFAULT_SALONES_PAGE);
  const [circuloAmigos, setCirculoAmigos] = useState<CmsCirculoAmigosPromo>(
    mergeCirculoAmigos(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const ready = !!token;

  const pageRef = useRef(page);
  const agendaItemsRef = useRef(agendaItems);
  const agendaHiddenRef = useRef(agendaHidden);
  const salonesItemsRef = useRef(salonesItems);
  const salonesPageRef = useRef(salonesPage);
  const salonesHiddenRef = useRef(salonesHidden);
  const circuloAmigosRef = useRef(circuloAmigos);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    agendaItemsRef.current = agendaItems;
  }, [agendaItems]);
  useEffect(() => {
    agendaHiddenRef.current = agendaHidden;
  }, [agendaHidden]);
  useEffect(() => {
    salonesItemsRef.current = salonesItems;
  }, [salonesItems]);
  useEffect(() => {
    salonesPageRef.current = salonesPage;
  }, [salonesPage]);
  useEffect(() => {
    salonesHiddenRef.current = salonesHidden;
  }, [salonesHidden]);
  useEffect(() => {
    circuloAmigosRef.current = circuloAmigos;
  }, [circuloAmigos]);

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setPage({ ...DEFAULT_PAGE, ...draft.sections.cursosPage });
    setAgendaItems(
      getCursosAgendaEntries(draft, CURSOS_PROXIMAS_CONVOCATORIAS),
    );
    setAgendaHidden([...(draft.sections.agendaHidden ?? [])]);
    const salonesLoaded = getSalonesForEdit(draft, SALONES);
    setSalonesItems(salonesLoaded.items);
    setSalonesHidden(salonesLoaded.hidden);
    setSalonesPage({ ...DEFAULT_SALONES_PAGE, ...draft.sections.salonesPage });
    setCirculoAmigos(
      mergeCirculoAmigos(draft.sections.culturaPage?.circuloAmigos),
    );
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDoc(
        latest,
        pageRef.current,
        agendaItemsRef.current,
        agendaHiddenRef.current,
        salonesItemsRef.current,
        salonesPageRef.current,
        salonesHiddenRef.current,
        circuloAmigosRef.current,
      );
      await saveCmsDraft("acropolis", token, next);
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
  }, [token]);

  const queueSave = useCallback(() => {
    window.setTimeout(() => void saveDraft(), 0);
  }, [saveDraft]);

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

  const patchPage = useCallback(
    (patch: Partial<CmsCursosPage>) => {
      setPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchAgendaItem = useCallback(
    (id: string, patch: Partial<CmsAgendaEntry>) => {
      setAgendaItems((list) =>
        list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addAgendaItem = useCallback(() => {
    const entry: CmsAgendaEntry = {
      id: newCursosAgendaId(),
      category: "curso",
      title: "Nueva convocatoria",
      startsAt: new Date().toISOString().slice(0, 10),
      date: "",
      time: "",
      sede: "",
      showOnHome: true,
      inscribeMessage:
        "Hola, me interesan los cursos y talleres de Nueva Acrópolis. ¿Me dan información?",
    };
    setAgendaItems((list) => [...list, entry]);
    setSelectedId(entry.id);
    markDirty();
  }, [markDirty]);

  const deleteAgendaItem = useCallback(
    (id: string) => {
      setAgendaItems((list) => {
        const next = list.filter((e) => e.id !== id);
        agendaItemsRef.current = next;
        return next;
      });
      setAgendaHidden((hidden) => {
        const next = hidden.includes(id) ? hidden : [...hidden, id];
        agendaHiddenRef.current = next;
        return next;
      });
      setSelectedId(null);
      markDirty();
      queueSave();
    },
    [markDirty, queueSave],
  );

  const getOfertaCards = useCallback(
    (kind: "cursos" | "conf") => {
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      const overrides =
        kind === "cursos" ? page.cursosTalleres : page.conferencias;
      const hidden =
        kind === "cursos"
          ? page.cursosTalleresHidden
          : page.conferenciasHidden;
      return mergeCursosCards(defaults, overrides, hidden);
    },
    [
      page.cursosTalleres,
      page.conferencias,
      page.cursosTalleresHidden,
      page.conferenciasHidden,
    ],
  );

  const ofertaKeys = (kind: "cursos" | "conf") =>
    kind === "cursos"
      ? {
          cards: "cursosTalleres" as const,
          hidden: "cursosTalleresHidden" as const,
        }
      : {
          cards: "conferencias" as const,
          hidden: "conferenciasHidden" as const,
        };

  const getHiddenOfertaCardsCb = useCallback(
    (kind: "cursos" | "conf") => {
      const { cards, hidden } = ofertaKeys(kind);
      return getHiddenOfertaCards(kind, page[cards], page[hidden]);
    },
    [page.cursosTalleres, page.conferencias, page.cursosTalleresHidden, page.conferenciasHidden],
  );

  const isOfertaCardHiddenCb = useCallback(
    (kind: "cursos" | "conf", id: string) => {
      const { hidden } = ofertaKeys(kind);
      return isOfertaCardHidden(kind, id, page[hidden]);
    },
    [page.cursosTalleresHidden, page.conferenciasHidden],
  );

  const patchOfertaCard = useCallback(
    (kind: "cursos" | "conf", id: string, patch: Partial<CmsCursosCard>) => {
      const { cards, hidden } = ofertaKeys(kind);
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      setPage((p) => {
        if (isOfertaCardHidden(kind, id, p[hidden])) {
          const byId = new Map((p[cards] ?? []).map((c) => [c.id, c]));
          const base = defaults.find((d) => d.id === id) ?? byId.get(id);
          if (!base) return p;
          const updated = { ...base, ...byId.get(id), ...patch };
          const rest = (p[cards] ?? []).filter((c) => c.id !== id);
          return { ...p, [cards]: [...rest, updated] };
        }
        const merged = mergeCursosCards(defaults, p[cards], p[hidden]);
        const next = merged.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        );
        return { ...p, [cards]: next };
      });
      markDirty();
    },
    [markDirty],
  );

  const addOfertaCard = useCallback(
    (kind: "cursos" | "conf") => {
      const card: CmsCursosCard = {
        id: newCursosCardId(kind),
        src: "",
        alt: "",
        title: kind === "cursos" ? "Nuevo curso o taller" : "Nueva conferencia",
        text: "",
        inscribeKind: kind === "cursos" ? "curso" : "conferencia",
      };
      const { cards, hidden } = ofertaKeys(kind);
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      setPage((p) => {
        const merged = mergeCursosCards(defaults, p[cards], p[hidden]);
        return { ...p, [cards]: [...merged, card] };
      });
      setSelectedId(ofertaSelectedId(kind, card.id));
      markDirty();
    },
    [markDirty],
  );

  const deleteOfertaCard = useCallback(
    (kind: "cursos" | "conf", id: string) => {
      const { cards, hidden } = ofertaKeys(kind);
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      setPage((p) => {
        let next: CmsCursosPage;
        if (defaults.some((d) => d.id === id)) {
          const nextHidden = [...new Set([...(p[hidden] ?? []), id])];
          next = { ...p, [hidden]: nextHidden };
        } else {
          const merged = mergeCursosCards(defaults, p[cards], p[hidden]);
          next = { ...p, [cards]: merged.filter((c) => c.id !== id) };
        }
        pageRef.current = next;
        return next;
      });
      setSelectedId(null);
      markDirty();
      queueSave();
    },
    [markDirty, queueSave],
  );

  const restoreOfertaCard = useCallback(
    (kind: "cursos" | "conf", id: string) => {
      const { hidden } = ofertaKeys(kind);
      setPage((p) => ({
        ...p,
        [hidden]: (p[hidden] ?? []).filter((hid) => hid !== id),
      }));
      markDirty();
    },
    [markDirty],
  );

  const patchSalon = useCallback(
    (id: string, patch: Partial<CmsSalon>) => {
      setSalonesItems((list) =>
        list.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addSalon = useCallback((options?: AddSalonOptions) => {
    const id = newSalonId();
    const defaultSede: SalonSede = options?.sede ?? options?.atStartOfSede ?? "Naco";

    setSalonesItems((list) => {
      let sede: SalonSede = defaultSede;
      let city: CmsSalon["city"] =
        sede === "Santiago" ? "Santiago" : "Santo Domingo";

      if (options?.afterId) {
        const after = list.find((s) => s.id === options.afterId);
        if (after) {
          sede = after.sede;
          city = after.city;
        }
      }

      const entry: CmsSalon = {
        id,
        name: "Nuevo salón",
        sede,
        city,
        summary: "",
        featuredLayout: "butacas",
        capacities: { butacas: 0, mesas: 0, herradura: 0 },
        image: { src: "", alt: "" },
      };

      if (options?.afterId) {
        const idx = list.findIndex((s) => s.id === options.afterId);
        if (idx >= 0) {
          const next = [...list];
          next.splice(idx + 1, 0, entry);
          return next;
        }
      }

      if (options?.atStartOfSede) {
        const idx = list.findIndex((s) => s.sede === options.atStartOfSede);
        const next = [...list];
        if (idx >= 0) {
          next.splice(idx, 0, entry);
        } else {
          next.push(entry);
        }
        return next;
      }

      return [...list, entry];
    });

    setSelectedId(id);
    markDirty();
  }, [markDirty]);

  const hideSalon = useCallback(
    (id: string) => {
      setSalonesItems((list) => {
        const next = list.filter((s) => s.id !== id);
        salonesItemsRef.current = next;
        return next;
      });
      if (SALONES.some((s) => s.id === id)) {
        setSalonesHidden((h) => {
          const next = h.includes(id) ? h : [...h, id];
          salonesHiddenRef.current = next;
          return next;
        });
      }
      setSelectedId(null);
      markDirty();
      queueSave();
    },
    [markDirty, queueSave],
  );

  const patchSalonesPage = useCallback(
    (patch: Partial<CmsSalonesPage>) => {
      setSalonesPage((p) => ({ ...p, ...patch }));
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

  const value = useMemo(
    (): CursosCmsEditContextValue => ({
      ready,
      page,
      agendaItems,
      salonesItems,
      salonesPage,
      circuloAmigos,
      selectedId,
      setSelectedId,
      patchPage,
      patchAgendaItem,
      addAgendaItem,
      deleteAgendaItem,
      patchOfertaCard,
      addOfertaCard,
      deleteOfertaCard,
      patchSalon,
      addSalon,
      hideSalon,
      patchSalonesPage,
      patchCirculoAmigos,
      getOfertaCards,
      getHiddenOfertaCards: getHiddenOfertaCardsCb,
      isOfertaCardHidden: isOfertaCardHiddenCb,
      restoreOfertaCard,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      page,
      agendaItems,
      salonesItems,
      salonesPage,
      circuloAmigos,
      selectedId,
      patchPage,
      patchAgendaItem,
      addAgendaItem,
      deleteAgendaItem,
      patchOfertaCard,
      addOfertaCard,
      deleteOfertaCard,
      patchSalon,
      addSalon,
      hideSalon,
      patchSalonesPage,
      patchCirculoAmigos,
      getOfertaCards,
      getHiddenOfertaCardsCb,
      isOfertaCardHiddenCb,
      restoreOfertaCard,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selectedAgenda = agendaItems.find((e) => e.id === selectedId);
  const selectedSalon = salonesItems.find((s) => s.id === selectedId);
  const ofertaSel = selectedId ? parseOfertaSelectedId(selectedId) : null;
  const selectedOferta =
    ofertaSel &&
    findOfertaCard(
      ofertaSel.kind,
      ofertaSel.cardId,
      ofertaSel.kind === "cursos" ? page.cursosTalleres : page.conferencias,
      ofertaSel.kind === "cursos"
        ? page.cursosTalleresHidden
        : page.conferenciasHidden,
    );

  return (
    <CursosCmsEditContext.Provider value={value}>
      {embedded ? null : (
        <EditToolbar
          label="Cursos y salones"
          dirty={dirty}
          busy={busy}
          status={status}
          onSave={() => void saveDraft()}
          onPublish={() => void publish()}
        />
      )}
      {!ready ? (
        <div className="bg-amber-50 py-3 text-center text-sm text-na-muted">
          Conectando con el editor…
        </div>
      ) : null}
      {children}

      {selectedId === "__hero__" ? (
        <EditPanelChrome
          title="Encabezado de la página"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields value={page} onChange={patchPage} carouselKey="cursos" />
        </EditPanelChrome>
      ) : null}

      {selectedId === "__proximasSection__" ? (
        <EditPanelChrome
          title="Textos — Próximas convocatorias"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={page.proximasTitle ?? ""}
              onChange={(v) => patchPage({ proximasTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.proximasIntro ?? ""}
              onChange={(v) => patchPage({ proximasIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedAgenda && !ofertaSel && !selectedSalon ? (
        <EditPanelChrome
          title="Editar convocatoria"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <AgendaEntryEditFields
            entry={selectedAgenda}
            token={token}
            onChange={(patch) => patchAgendaItem(selectedAgenda.id, patch)}
            onDelete={() => {
              if (
                window.confirm(
                  "¿Eliminar esta convocatoria? Se ocultará de Cursos y de la agenda pública. El borrador se guardará automáticamente.",
                )
              ) {
                deleteAgendaItem(selectedAgenda.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}

      {selectedId === CURSOS_INSCRIBE_SECTION_ID ? (
        <EditPanelChrome
          title="Bloque — Inscripción por WhatsApp"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título del bloque verde"
              value={page.inscribeTitle ?? ""}
              onChange={(v) => patchPage({ inscribeTitle: v })}
            />
            <EditField
              label="Texto"
              value={page.inscribeText ?? ""}
              onChange={(v) => patchPage({ inscribeText: v })}
              multiline
            />
            <EditField
              label="Texto del botón"
              value={page.inscribeCtaLabel ?? ""}
              onChange={(v) => patchPage({ inscribeCtaLabel: v })}
            />
            <EditField
              label="Número WhatsApp del botón"
              value={page.inscribeWhatsappNumber ?? ""}
              onChange={(v) => patchPage({ inscribeWhatsappNumber: v })}
            />
            <p className="-mt-2 text-xs text-slate-500">
              Vacío = número de WhatsApp cursos del pie de página (CMS global).
            </p>
            <EditField
              label="Mensaje prellenado de WhatsApp"
              value={page.inscribeWhatsappMessage ?? ""}
              onChange={(v) => patchPage({ inscribeWhatsappMessage: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__ofertaSection__" ? (
        <EditPanelChrome
          title="Textos — Oferta formativa"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={page.ofertaEyebrow ?? ""}
              onChange={(v) => patchPage({ ofertaEyebrow: v })}
            />
            <EditField
              label="Intro — Cursos y talleres"
              value={page.ofertaCursosIntro ?? ""}
              onChange={(v) => patchPage({ ofertaCursosIntro: v })}
              multiline
            />
            <EditField
              label="Intro — Conferencias culturales"
              value={page.ofertaConferenciasIntro ?? ""}
              onChange={(v) => patchPage({ ofertaConferenciasIntro: v })}
              multiline
            />
            {(page.cursosTalleresHidden?.length ?? 0) > 0 ? (
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-700">
                  Cursos ocultos
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  También los ves al final de la página, en «Ocultos del catálogo».
                </p>
                <ul className="mt-2 space-y-2">
                  {page.cursosTalleresHidden!.map((id) => {
                    const card =
                      CURSOS_TALLERES_DEFAULTS.find((c) => c.id === id);
                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span>{card?.title ?? id}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded-full border border-emerald-300 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                          onClick={() => restoreOfertaCard("cursos", id)}
                        >
                          Mostrar de nuevo
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
            {(page.conferenciasHidden?.length ?? 0) > 0 ? (
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-700">
                  Conferencias ocultas
                </p>
                <ul className="mt-2 space-y-2">
                  {page.conferenciasHidden!.map((id) => {
                    const card = CONFERENCIAS_DEFAULTS.find((c) => c.id === id);
                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span>{card?.title ?? id}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded-full border border-emerald-300 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                          onClick={() => restoreOfertaCard("conf", id)}
                        >
                          Mostrar de nuevo
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedOferta && ofertaSel ? (
        <EditPanelChrome
          title={`Editar — ${selectedOferta.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <CursosCardEditFields
            card={selectedOferta}
            token={token}
            ofertaKind={ofertaSel.kind}
            isHidden={isOfertaCardHiddenCb(ofertaSel.kind, selectedOferta.id)}
            onChange={(patch) =>
              patchOfertaCard(ofertaSel.kind, selectedOferta.id, patch)
            }
            onRestore={() => restoreOfertaCard(ofertaSel.kind, selectedOferta.id)}
            onDelete={() => {
              const catalog = isCatalogOfertaCard(
                selectedOferta.id,
                ofertaSel.kind,
              );
              const msg = catalog
                ? `¿Ocultar «${selectedOferta.title}»? Dejará de mostrarse en la web. El borrador se guardará automáticamente; publica para que los visitantes lo vean.`
                : `¿Eliminar «${selectedOferta.title}»? Se quitará por completo del CMS.`;
              if (window.confirm(msg)) {
                deleteOfertaCard(ofertaSel.kind, selectedOferta.id);
              }
            }}
            deleteMode={
              isCatalogOfertaCard(selectedOferta.id, ofertaSel.kind)
                ? "hide"
                : "remove"
            }
          />
        </EditPanelChrome>
      ) : null}

      {selectedId === "__salonesSection__" ? (
        <EditPanelChrome
          title="Textos — Salones en alquiler"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={salonesPage.eyebrow ?? ""}
              onChange={(v) => patchSalonesPage({ eyebrow: v })}
            />
            <EditField
              label="Título"
              value={salonesPage.title ?? ""}
              onChange={(v) => patchSalonesPage({ title: v })}
            />
            <EditField
              label="Introducción"
              value={salonesPage.intro ?? ""}
              onChange={(v) => patchSalonesPage({ intro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedSalon && !ofertaSel && !selectedAgenda ? (
        <EditPanelChrome
          title={`Editar salón — ${selectedSalon.name}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Nombre"
              value={selectedSalon.name}
              onChange={(v) => patchSalon(selectedSalon.id, { name: v })}
            />
            <EditField
              label="Resumen"
              value={selectedSalon.summary}
              onChange={(v) => patchSalon(selectedSalon.id, { summary: v })}
              multiline
            />
            <label className="block text-sm">
              <span className="font-semibold text-slate-700">Sede</span>
              <select
                value={selectedSalon.sede}
                onChange={(e) =>
                  patchSalon(selectedSalon.id, {
                    sede: e.target.value as CmsSalon["sede"],
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Naco">Naco</option>
                <option value="Los Prados">Los Prados</option>
                <option value="Santiago">Santiago</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-slate-700">
                Disposición destacada en la foto
              </span>
              <select
                value={selectedSalon.featuredLayout}
                onChange={(e) =>
                  patchSalon(selectedSalon.id, {
                    featuredLayout: e.target
                      .value as CmsSalon["featuredLayout"],
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {LAYOUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(["butacas", "mesas", "herradura"] as const).map((layout) => (
                <EditField
                  key={layout}
                  label={`Capacidad ${layout}`}
                  value={String(selectedSalon.capacities[layout])}
                  onChange={(v) => {
                    const n = parseInt(v, 10);
                    if (!Number.isNaN(n)) {
                      patchSalon(selectedSalon.id, {
                        capacities: {
                          ...selectedSalon.capacities,
                          [layout]: n,
                        },
                      });
                    }
                  }}
                />
              ))}
            </div>
            <ImageField
              label="Foto del salón"
              media={selectedSalon.image}
              token={token}
              onChange={(image) => patchSalon(selectedSalon.id, { image })}
            />
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `¿Ocultar «${selectedSalon.name}»? No se verá en el sitio público.`,
                  )
                ) {
                  hideSalon(selectedSalon.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === CIRCULO_AMIGOS_SELECTED_ID ? (
        <EditPanelChrome
          title="Círculo de Amigos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <CirculoAmigosEditFields
            value={circuloAmigos}
            token={token}
            onChange={patchCirculoAmigos}
          />
        </EditPanelChrome>
      ) : null}
    </CursosCmsEditContext.Provider>
  );
}

function CursosCardEditFields({
  card,
  token,
  onChange,
  onDelete,
  onRestore,
  deleteMode = "hide",
  isHidden = false,
  ofertaKind = "cursos",
}: {
  card: CmsCursosCard;
  token: string | null;
  onChange: (patch: Partial<CmsCursosCard>) => void;
  onDelete?: () => void;
  onRestore?: () => void;
  /** hide = catálogo base (solo ocultar); remove = tarjeta creada en CMS (eliminar). */
  deleteMode?: "hide" | "remove";
  isHidden?: boolean;
  ofertaKind?: "cursos" | "conf";
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(card.src);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file);
      onChange({ src: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <EditField
        label="Título"
        value={card.title}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Descripción"
        value={card.text}
        onChange={(v) => onChange({ text: v })}
        multiline
      />
      {ofertaKind === "cursos" ? (
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">
            Ubicación en la página de cursos
          </span>
          <select
            value={
              card.activo === true
                ? "activo"
                : card.activo === false
                  ? "otros"
                  : "auto"
            }
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                activo:
                  v === "activo" ? true : v === "otros" ? false : undefined,
              });
            }}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm spellcheck-field"
          >
            <option value="auto">Automático (según catálogo base)</option>
            <option value="activo">Cursos activos</option>
            <option value="otros">Otros cursos y talleres</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            «Cursos activos» = horario fijo todo el año. «Otros» = por temporada
            o convocatoria. Si no eliges, se mantiene la ubicación del catálogo
            original.
          </p>
        </label>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <EditField
          label="Fecha de apertura (texto)"
          value={card.fechaApertura ?? ""}
          onChange={(v) => onChange({ fechaApertura: v })}
        />
        <EditField
          label="Fecha ISO (YYYY-MM-DD)"
          value={card.fechaAperturaIso ?? ""}
          onChange={(v) => onChange({ fechaAperturaIso: v })}
        />
      </div>
      <p className="text-xs text-slate-600">
        Ejemplo de fecha de apertura: «Apertura: 15 de marzo» o «Temporada
        2026». La fecha ISO es opcional.
      </p>
      <EditField
        label="Facilitador"
        value={card.facilitador ?? ""}
        onChange={(v) => onChange({ facilitador: v })}
      />
      <EditField
        label="Sede"
        value={card.sede ?? ""}
        onChange={(v) => onChange({ sede: v })}
      />
      <EditField
        label="Etiqueta temática"
        value={card.tag ?? ""}
        onChange={(v) => onChange({ tag: v })}
      />
      <EditField
        label="Etiqueta de acceso (conferencias)"
        value={card.accessLabel ?? ""}
        onChange={(v) => onChange({ accessLabel: v })}
      />
      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium">Botón «Solicitar info»</legend>
        <p className="text-xs text-slate-500">
          Si dejas el número vacío, se usa el de cursos del pie de página. Si
          dejas el mensaje vacío, se genera con el título y la sede.
        </p>
        <EditField
          label="Texto del botón"
          value={card.inscribeLabel ?? ""}
          onChange={(v) => onChange({ inscribeLabel: v })}
        />
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Tipo en WhatsApp</span>
          <select
            value={card.inscribeKind ?? "curso"}
            onChange={(e) =>
              onChange({
                inscribeKind: e.target.value as NonNullable<
                  CmsCursosCard["inscribeKind"]
                >,
              })
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm spellcheck-field"
          >
            <option value="curso">Curso</option>
            <option value="taller">Taller</option>
            <option value="conferencia">Conferencia</option>
            <option value="actividad">Actividad</option>
          </select>
        </label>
        <EditField
          label="Número WhatsApp (opcional)"
          value={card.inscribeWhatsappNumber ?? ""}
          onChange={(v) => onChange({ inscribeWhatsappNumber: v })}
        />
        <EditField
          label="Mensaje WhatsApp (opcional)"
          value={card.inscribeWhatsappMessage ?? ""}
          onChange={(v) => onChange({ inscribeWhatsappMessage: v })}
          multiline
        />
      </fieldset>
      <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium">Foto</legend>
        <EditField
          label="Ruta de la imagen (URL)"
          value={card.src}
          onChange={(v) => onChange({ src: v })}
        />
        <p className="text-xs text-amber-800">
          Recomendado: formato <strong>WebP</strong>.
        </p>
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt={card.alt || "Vista previa"}
            className="h-28 w-full rounded-lg object-cover"
          />
        ) : null}
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Subir foto</span>
          <input
            type="file"
            accept="image/webp,image/*,.webp"
            disabled={!token || uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
              e.target.value = "";
            }}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {uploading ? <p className="text-xs text-amber-700">Subiendo…</p> : null}
        <EditField
          label="Texto alternativo de la foto"
          value={card.alt}
          onChange={(v) => onChange({ alt: v })}
        />
      </fieldset>
      {isHidden ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-semibold">Oculto del sitio público</p>
          <p className="mt-1 text-xs text-amber-900/80">
            Los visitantes no ven esta tarjeta. Puedes editarla aquí y volver a
            publicarla cuando quieras.
          </p>
          {onRestore ? (
            <button
              type="button"
              onClick={onRestore}
              className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white"
            >
              Mostrar de nuevo en el sitio
            </button>
          ) : null}
        </div>
      ) : null}
      {onDelete && !isHidden ? (
        <div className="space-y-1">
          <button
            type="button"
            onClick={onDelete}
            className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
          >
            {deleteMode === "remove" ? "Eliminar tarjeta" : "Ocultar del catálogo"}
          </button>
          {deleteMode === "hide" ? (
            <p className="text-xs text-slate-500">
              Los cursos del catálogo base no se pueden borrar del sistema; solo
              ocultar en la web. Las tarjetas que añades con «+ Añadir curso» sí
              se pueden eliminar.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function CursosCmsEditProvider({
  children,
  embedded = false,
}: {
  children: ReactNode;
  /** En home: lápices sin segunda barra de guardado (usa la de Inicio). */
  embedded?: boolean;
}) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return (
    <CursosCmsEditInner embedded={embedded}>{children}</CursosCmsEditInner>
  );
}
