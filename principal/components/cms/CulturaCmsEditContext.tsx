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
import { CULTURA_PROXIMAS_ACTIVIDADES } from "@/lib/cultura-agenda";
import {
  getCulturaEntries,
  mergeCulturaIntoDoc,
  newCulturaId,
} from "@/lib/cms/agenda-edit";
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
import type {
  CmsAgendaEntry,
  CmsCirculoAmigosPromo,
  CmsCulturaCard,
  CmsCulturaPage,
  CmsDocument,
  CmsEvento,
  CmsViajeCategoriaPage,
  CmsViajesPage,
} from "@/lib/cms/types";
import {
  CULTURA_EVENTOS_PREVIEW_DEFAULTS,
  CULTURA_TALLERES_DEFAULTS,
  CULTURA_VIAJES_SECTION,
} from "@/lib/cultura-content";
import {
  culturaCardSelectedId,
  mergeCulturaCards,
  parseCulturaCardSelectedId,
} from "@/lib/cms/cultura-display";
import { parseViajeCardSelectedId, mergeViajeCategoriaPage } from "@/lib/cms/viajes-display";
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
import { appendEventoDraftsToDoc } from "@/lib/cms/content-edit";
import { promoteAgendaEntryLocally } from "@/lib/agenda-evento";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { CIRCULO_AMIGOS_SELECTED_ID, mergeCirculoAmigos } from "@/lib/cms/circulo-amigos-display";

const DEFAULT_CULTURA_PAGE: CmsCulturaPage = {
  proximasTitle: "Próximas actividades",
  proximasIntro:
    "Clases, ensayos y encuentros culturales en nuestras sedes de Santo Domingo y en el Punto Cultural Roberto Pastoriza. Haz clic para ver más.",
};

type CulturaCmsEditContextValue = {
  ready: boolean;
  items: CmsAgendaEntry[];
  culturaPage: CmsCulturaPage;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchItem: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  patchCulturaPage: (patch: Partial<CmsCulturaPage>) => void;
  patchTaller: (id: string, patch: Partial<CmsCulturaCard>) => void;
  patchEventoPreview: (id: string, patch: Partial<CmsCulturaCard>) => void;
  addEventoPreview: () => void;
  deleteEventoPreview: (id: string) => void;
  patchCirculoAmigos: (patch: Partial<CmsCirculoAmigosPromo>) => void;
  viajesPage: CmsViajesPage;
  patchViajeCategoria: (
    categoria: "locales" | "internacionales",
    patch: Partial<CmsViajeCategoriaPage>,
  ) => void;
  addItem: () => void;
  deleteItem: (id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const CulturaCmsEditContext = createContext<CulturaCmsEditContextValue | null>(
  null,
);

export function useCulturaCmsEdit() {
  return useContext(CulturaCmsEditContext);
}

function buildDoc(
  base: CmsDocument,
  items: CmsAgendaEntry[],
  culturaPage: CmsCulturaPage,
  viajesPage: CmsViajesPage,
  eventoDrafts: CmsEvento[] = [],
): CmsDocument {
  const withAgenda = mergeCulturaIntoDoc(base, items);
  const withDrafts = appendEventoDraftsToDoc(withAgenda, eventoDrafts);
  return mergeHeroCarouselsIntoDoc({
    ...withDrafts,
    sections: {
      ...withDrafts.sections,
      culturaPage,
      viajesPage,
    },
  });
}

function CulturaCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsAgendaEntry[]>([]);
  const [culturaPage, setCulturaPage] = useState<CmsCulturaPage>(
    DEFAULT_CULTURA_PAGE,
  );
  const [viajesPage, setViajesPage] = useState<CmsViajesPage>({});
  const [eventoDrafts, setEventoDrafts] = useState<CmsEvento[]>([]);
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
    setDoc(draft);
    setItems(getCulturaEntries(draft, CULTURA_PROXIMAS_ACTIVIDADES));
    setCulturaPage({
      ...DEFAULT_CULTURA_PAGE,
      ...draft.sections.culturaPage,
    });
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
      const next = buildDoc(latest, items, culturaPage, viajesPage, eventoDrafts);
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
  }, [token, items, culturaPage, viajesPage]);

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
      const next = buildDoc(latest, items, culturaPage, viajesPage, eventoDrafts);
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
  }, [token, items, culturaPage, viajesPage]);

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

  const promoteToEvento = useCallback(
    (entry: CmsAgendaEntry) => {
      const existingSlugs = eventoDrafts.map((e) => e.slug);
      const { updatedEntry, draft } = promoteAgendaEntryLocally(
        entry,
        existingSlugs,
      );
      setItems((list) =>
        list.map((e) => (e.id === entry.id ? updatedEntry : e)),
      );
      setEventoDrafts((list) => [...list, draft]);
      markDirty();
      window.alert(
        `Borrador creado: /eventos/${draft.slug}. Edítalo y publícalo en Eventos.`,
      );
    },
    [eventoDrafts, markDirty],
  );

  const patchItem = useCallback(
    (id: string, patch: Partial<CmsAgendaEntry>) => {
      setItems((list) =>
        list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      markDirty();
    },
    [markDirty],
  );

  const patchCulturaPage = useCallback(
    (patch: Partial<CmsCulturaPage>) => {
      setCulturaPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchTaller = useCallback(
    (id: string, patch: Partial<CmsCulturaCard>) => {
      setCulturaPage((p) => {
        const current = mergeCulturaCards(CULTURA_TALLERES_DEFAULTS, p.talleres);
        return {
          ...p,
          talleres: current.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchEventoPreview = useCallback(
    (id: string, patch: Partial<CmsCulturaCard>) => {
      setCulturaPage((p) => {
        const current = mergeCulturaCards(
          CULTURA_EVENTOS_PREVIEW_DEFAULTS,
          p.eventosPreview,
        );
        return {
          ...p,
          eventosPreview: current.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        };
      });
      markDirty();
    },
    [markDirty],
  );

  const addEventoPreview = useCallback(() => {
    const item: CmsCulturaCard = {
      id: `cultura-evento-${Date.now()}`,
      src: "",
      alt: "",
      title: "Nuevo evento cultural",
      text: "",
      date: "",
      sede: "",
    };
    setCulturaPage((p) => {
      const current = mergeCulturaCards(
        CULTURA_EVENTOS_PREVIEW_DEFAULTS,
        p.eventosPreview,
      );
      return { ...p, eventosPreview: [...current, item] };
    });
    setSelectedId(culturaCardSelectedId("evento", item.id));
    markDirty();
  }, [markDirty]);

  const deleteEventoPreview = useCallback(
    (id: string) => {
      setCulturaPage((p) => {
        const current = mergeCulturaCards(
          CULTURA_EVENTOS_PREVIEW_DEFAULTS,
          p.eventosPreview,
        );
        return {
          ...p,
          eventosPreview: current.filter((c) => c.id !== id),
        };
      });
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const patchCirculoAmigos = useCallback(
    (patch: Partial<CmsCirculoAmigosPromo>) => {
      setCulturaPage((p) => ({
        ...p,
        circuloAmigos: { ...p.circuloAmigos, ...patch },
      }));
      markDirty();
    },
    [markDirty],
  );

  const patchViajeCategoria = useCallback(
    (
      categoria: "locales" | "internacionales",
      patch: Partial<CmsViajeCategoriaPage>,
    ) => {
      setViajesPage((p) => ({
        ...p,
        [categoria]: { ...p[categoria], ...patch },
      }));
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(() => {
    const entry: CmsAgendaEntry = {
      id: newCulturaId(),
      category: "cultura",
      title: "Nueva actividad cultural",
      startsAt: new Date().toISOString().slice(0, 10),
      date: "",
      time: "",
      sede: "",
      tag: "Clase",
      showOnHome: false,
      detailHref: "/cultura",
      detailLabel: "Ver cultura",
      image: undefined,
      imageAlt: "",
      description: "",
      inscribeMessage:
        "Hola, me interesa una actividad cultural de Nueva Acrópolis. ¿Me pueden dar más información?",
    };
    setItems((list) => [...list, entry]);
    setSelectedId(entry.id);
    markDirty();
    requestAnimationFrame(() => {
      document
        .getElementById("cultura-proximas")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [markDirty]);

  const deleteItem = useCallback(
    (id: string) => {
      setItems((list) => list.filter((e) => e.id !== id));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): CulturaCmsEditContextValue => ({
      ready,
      items,
      culturaPage,
      selectedId,
      setSelectedId,
      patchItem,
      patchCulturaPage,
      patchTaller,
      patchEventoPreview,
      addEventoPreview,
      deleteEventoPreview,
      patchCirculoAmigos,
      viajesPage,
      patchViajeCategoria,
      addItem,
      deleteItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      items,
      culturaPage,
      selectedId,
      patchItem,
      patchCulturaPage,
      patchTaller,
      patchEventoPreview,
      addEventoPreview,
      deleteEventoPreview,
      patchCirculoAmigos,
      viajesPage,
      patchViajeCategoria,
      addItem,
      deleteItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selectedViajeCategoria = selectedId
    ? parseViajeCardSelectedId(selectedId)
    : null;
  const selected =
    selectedId &&
    !selectedId.startsWith("__") &&
    !selectedId.startsWith("viaje-") &&
    !selectedId.includes(":")
      ? items.find((e) => e.id === selectedId)
      : undefined;
  const cardSelection = parseCulturaCardSelectedId(selectedId);
  const selectedTaller =
    cardSelection?.kind === "taller"
      ? mergeCulturaCards(CULTURA_TALLERES_DEFAULTS, culturaPage.talleres).find(
          (c) => c.id === cardSelection.id,
        )
      : undefined;
  const selectedEvento =
    cardSelection?.kind === "evento"
      ? mergeCulturaCards(
          CULTURA_EVENTOS_PREVIEW_DEFAULTS,
          culturaPage.eventosPreview,
        ).find((c) => c.id === cardSelection.id)
      : undefined;

  const selectedViajeValues = selectedViajeCategoria
    ? mergeViajeCategoriaPage(
        selectedViajeCategoria,
        viajesPage[selectedViajeCategoria],
      )
    : null;

  return (
    <CulturaCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Cultura"
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
          title="Editar actividad cultural"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <AgendaEntryEditFields
            entry={selected}
            token={token}
            onChange={(patch) => patchItem(selected.id, patch)}
            onPromoteToEvento={promoteToEvento}
            showHomeToggle={false}
            onDelete={() => {
              if (window.confirm("¿Eliminar esta actividad?")) {
                deleteItem(selected.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
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
              label="Título de la sección"
              value={culturaPage.proximasTitle ?? ""}
              onChange={(v) => patchCulturaPage({ proximasTitle: v })}
            />
            <EditField
              label="Texto introductorio"
              value={culturaPage.proximasIntro ?? ""}
              onChange={(v) => patchCulturaPage({ proximasIntro: v })}
              multiline
            />
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
          <HeroEditFields value={culturaPage} onChange={patchCulturaPage} />
        </EditPanelChrome>
      ) : null}
      {selectedId === "__talleres-section__" ? (
        <EditPanelChrome
          title="Talleres — textos de la sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={culturaPage.talleresEyebrow ?? ""}
              onChange={(v) => patchCulturaPage({ talleresEyebrow: v })}
            />
            <EditField
              label="Título"
              value={culturaPage.talleresTitle ?? ""}
              onChange={(v) => patchCulturaPage({ talleresTitle: v })}
            />
            <EditField
              label="Introducción"
              value={culturaPage.talleresIntro ?? ""}
              onChange={(v) => patchCulturaPage({ talleresIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedTaller ? (
        <EditPanelChrome
          title={`Editar taller — ${selectedTaller.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <CulturaCardEditFields
            card={selectedTaller}
            token={token}
            onChange={(patch) => patchTaller(selectedTaller.id, patch)}
          />
        </EditPanelChrome>
      ) : null}
      {selectedId === "__eventos-section__" ? (
        <EditPanelChrome
          title="Eventos — textos de la sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={culturaPage.eventosEyebrow ?? ""}
              onChange={(v) => patchCulturaPage({ eventosEyebrow: v })}
            />
            <EditField
              label="Título"
              value={culturaPage.eventosTitle ?? ""}
              onChange={(v) => patchCulturaPage({ eventosTitle: v })}
            />
            <EditField
              label="Introducción"
              value={culturaPage.eventosIntro ?? ""}
              onChange={(v) => patchCulturaPage({ eventosIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedEvento ? (
        <EditPanelChrome
          title={`Editar evento — ${selectedEvento.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <CulturaCardEditFields
            card={selectedEvento}
            token={token}
            onChange={(patch) => patchEventoPreview(selectedEvento.id, patch)}
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Eliminar este evento de la sección?")) {
                deleteEventoPreview(selectedEvento.id);
              }
            }}
            className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800"
          >
            Eliminar evento
          </button>
        </EditPanelChrome>
      ) : null}
      {selectedId === "__viajes-section__" ? (
        <EditPanelChrome
          title="Viajes — textos de la sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={
                culturaPage.viajesEyebrow ?? CULTURA_VIAJES_SECTION.eyebrow
              }
              onChange={(v) => patchCulturaPage({ viajesEyebrow: v })}
            />
            <EditField
              label="Título"
              value={culturaPage.viajesTitle ?? CULTURA_VIAJES_SECTION.title}
              onChange={(v) => patchCulturaPage({ viajesTitle: v })}
            />
            <EditField
              label="Introducción"
              value={culturaPage.viajesIntro ?? CULTURA_VIAJES_SECTION.intro}
              onChange={(v) => patchCulturaPage({ viajesIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
      {selectedViajeCategoria ? (
        <EditPanelChrome
          title={
            selectedViajeCategoria === "locales"
              ? "Viajes locales"
              : "Viajes internacionales"
          }
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
              Estos textos e imagen se usan en la tarjeta de{" "}
              <strong>/cultura</strong> y en el encabezado de{" "}
              <strong>/cultura/viajes/{selectedViajeCategoria}</strong>.
            </p>
            <HeroEditFields
              value={selectedViajeValues ?? {}}
              onChange={(patch) =>
                patchViajeCategoria(selectedViajeCategoria, patch)
              }
            />
            <ImageField
              label="Foto de portada"
              media={
                selectedViajeValues?.heroImage ?? { src: "", alt: "" }
              }
              token={token}
              onChange={(heroImage) =>
                patchViajeCategoria(selectedViajeCategoria, { heroImage })
              }
            />
            <EditField
              label="Introducción (página de destinos)"
              value={selectedViajeValues?.intro ?? ""}
              onChange={(v) =>
                patchViajeCategoria(selectedViajeCategoria, { intro: v })
              }
              multiline
            />
            <EditField
              label="Texto de la tarjeta en /cultura"
              value={selectedViajeValues?.cardText ?? ""}
              onChange={(v) =>
                patchViajeCategoria(selectedViajeCategoria, { cardText: v })
              }
              multiline
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
            value={mergeCirculoAmigos(culturaPage.circuloAmigos)}
            token={token}
            onChange={patchCirculoAmigos}
          />
        </EditPanelChrome>
      ) : null}
    </CulturaCmsEditContext.Provider>
  );
}

function CulturaCardEditFields({
  card,
  token,
  onChange,
}: {
  card: CmsCulturaCard;
  token: string | null;
  onChange: (patch: Partial<CmsCulturaCard>) => void;
}) {
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
      <EditField
        label="Fecha / horario (opcional)"
        value={card.date ?? ""}
        onChange={(v) => onChange({ date: v })}
      />
      <EditField
        label="Lugar / sede (opcional)"
        value={card.sede ?? ""}
        onChange={(v) => onChange({ sede: v })}
      />
      <CulturaCardImageField
        src={card.src}
        alt={card.alt}
        token={token}
        onChange={(patch) =>
          onChange({
            ...(patch.imageSrc !== undefined ? { src: patch.imageSrc } : {}),
            ...(patch.imageAlt !== undefined ? { alt: patch.imageAlt } : {}),
          })
        }
      />
    </div>
  );
}

function CulturaCardImageField({
  src,
  alt,
  token,
  onChange,
}: {
  src: string;
  alt: string;
  token: string | null;
  onChange: (patch: { imageSrc?: string; imageAlt?: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(src);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file);
      onChange({ imageSrc: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">Foto</p>
      {previewSrc ? (
        <img
          src={previewSrc}
          alt={alt || "Vista previa"}
          className="h-32 w-full rounded-lg object-cover"
        />
      ) : null}
      <input
        type="file"
        accept="image/*"
        disabled={!token || uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f);
        }}
        className="block w-full text-sm"
      />
      <EditField
        label="Texto alternativo de la foto"
        value={alt}
        onChange={(v) => onChange({ imageAlt: v })}
      />
    </div>
  );
}

function CulturaAgendaImageField({
  image,
  imageAlt,
  token,
  onChange,
}: {
  image: string;
  imageAlt: string;
  token: string | null;
  onChange: (patch: { image?: string; imageAlt?: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(image);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file);
      onChange({ image: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">Foto</p>
      {previewSrc ? (
        <img
          src={previewSrc}
          alt={imageAlt || "Vista previa"}
          className="h-24 w-full rounded-lg object-cover"
        />
      ) : null}
      <input
        type="file"
        accept="image/*"
        disabled={!token || uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f);
        }}
        className="block w-full text-sm"
      />
      <EditField
        label="Texto alternativo de la foto"
        value={imageAlt}
        onChange={(v) => onChange({ imageAlt: v })}
      />
    </div>
  );
}

export function CulturaCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <CulturaCmsEditInner>{children}</CulturaCmsEditInner>;
}
