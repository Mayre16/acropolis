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
import { CURSOS_PROXIMAS_CONVOCATORIAS } from "@/lib/cursos-agenda";
import { SALONES } from "@/lib/salones";
import {
  getCursosAgendaEntries,
  mergeCursosAgendaIntoDoc,
  newCursosAgendaId,
} from "@/lib/cms/agenda-edit";
import {
  CONFERENCIAS_DEFAULTS,
  CURSOS_TALLERES_DEFAULTS,
  mergeCursosCards,
  newCursosCardId,
  ofertaSelectedId,
  parseOfertaSelectedId,
} from "@/lib/cms/cursos-oferta-edit";
import {
  fetchCmsDraft,
  publishCms,
  resolveCmsMediaUrl,
  saveCmsDraft,
  uploadCmsImage,
} from "@/lib/cms/api-client";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import {
  buildDocWithSalones,
  DEFAULT_SALONES_PAGE,
  getSalonesForEdit,
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
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { DEFAULT_OFERTA_COPY } from "@/lib/cms/cursos-display";

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
  patchSalon: (id: string, patch: Partial<CmsSalon>) => void;
  patchSalonesPage: (patch: Partial<CmsSalonesPage>) => void;
  patchCirculoAmigos: (patch: Partial<CmsCirculoAmigosPromo>) => void;
  getOfertaCards: (kind: "cursos" | "conf") => CmsCursosCard[];
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
  salonesItems: CmsSalon[],
  salonesPage: CmsSalonesPage,
  circuloAmigos: CmsCirculoAmigosPromo,
): CmsDocument {
  const withAgenda = mergeCursosAgendaIntoDoc(base, agendaItems);
  const withSalones = buildDocWithSalones(withAgenda, salonesItems, salonesPage);
  return mergeHeroCarouselsIntoDoc({
    ...withSalones,
    sections: {
      ...withSalones.sections,
      cursosPage: page,
      culturaPage: {
        ...withSalones.sections.culturaPage,
        circuloAmigos,
      },
    },
  });
}

function CursosCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<CmsCursosPage>(DEFAULT_PAGE);
  const [agendaItems, setAgendaItems] = useState<CmsAgendaEntry[]>([]);
  const [salonesItems, setSalonesItems] = useState<CmsSalon[]>([]);
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

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setPage({ ...DEFAULT_PAGE, ...draft.sections.cursosPage });
    setAgendaItems(
      getCursosAgendaEntries(draft, CURSOS_PROXIMAS_CONVOCATORIAS),
    );
    setSalonesItems(getSalonesForEdit(draft, SALONES));
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
        page,
        agendaItems,
        salonesItems,
        salonesPage,
        circuloAmigos,
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
  }, [token, page, agendaItems, salonesItems, salonesPage, circuloAmigos]);

  const publish = useCallback(async () => {
    if (!token) return;
    if (
      !window.confirm(
        "¿Publicar? Los visitantes verán estos cambios en la página de cursos y salones.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDoc(
        latest,
        page,
        agendaItems,
        salonesItems,
        salonesPage,
        circuloAmigos,
      );
      await saveCmsDraft("acropolis", token, next);
      const publishResult = await publishCms("acropolis", token);
      setDirty(false);
      setStatus(publishResult.message ?? "Publicado.");
} catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, page, agendaItems, salonesItems, salonesPage, circuloAmigos]);

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
      setAgendaItems((list) => list.filter((e) => e.id !== id));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const getOfertaCards = useCallback(
    (kind: "cursos" | "conf") => {
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      const overrides =
        kind === "cursos" ? page.cursosTalleres : page.conferencias;
      return mergeCursosCards(defaults, overrides);
    },
    [page.cursosTalleres, page.conferencias],
  );

  const patchOfertaCard = useCallback(
    (kind: "cursos" | "conf", id: string, patch: Partial<CmsCursosCard>) => {
      const key = kind === "cursos" ? "cursosTalleres" : "conferencias";
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      setPage((p) => {
        const merged = mergeCursosCards(defaults, p[key]);
        const next = merged.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        );
        return { ...p, [key]: next };
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
      const key = kind === "cursos" ? "cursosTalleres" : "conferencias";
      const defaults =
        kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
      setPage((p) => {
        const merged = mergeCursosCards(defaults, p[key]);
        return { ...p, [key]: [...merged, card] };
      });
      setSelectedId(ofertaSelectedId(kind, card.id));
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
      patchSalon,
      patchSalonesPage,
      patchCirculoAmigos,
      getOfertaCards,
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
      patchSalon,
      patchSalonesPage,
      patchCirculoAmigos,
      getOfertaCards,
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
    getOfertaCards(ofertaSel.kind).find((c) => c.id === ofertaSel.cardId);

  return (
    <CursosCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Cursos y salones"
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
          title="Encabezado de la página"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <HeroEditFields value={page} onChange={patchPage} />
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
              if (window.confirm("¿Eliminar esta convocatoria?")) {
                deleteAgendaItem(selectedAgenda.id);
              }
            }}
          />
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
            onChange={(patch) =>
              patchOfertaCard(ofertaSel.kind, selectedOferta.id, patch)
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
}: {
  card: CmsCursosCard;
  token: string | null;
  onChange: (patch: Partial<CmsCursosCard>) => void;
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
    </div>
  );
}

export function CursosCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <CursosCmsEditInner>{children}</CursosCmsEditInner>;
}
