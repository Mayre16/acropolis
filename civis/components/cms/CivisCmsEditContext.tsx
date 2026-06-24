"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CIVIS_CLIENTES, CIVIS_ENTRENADORES } from "@/lib/civis-content";
import { TALLERES_CIVIS } from "@/lib/talleres";
import {
  PROXIMAS_ACTIVIDADES,
  TALLERES_REALIZADOS,
} from "@/lib/talleres-actividades";
import {
  fetchCmsDraft,
  publishCms,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import type {
  CmsCivisCliente,
  CmsCivisEntrenador,
  CmsCivisHomePage,
  CmsCivisHomePrincipios,
  CmsCivisProximaActividad,
  CmsCivisQuienesCivis,
  CmsCivisQuienesNa,
  CmsCivisQuienesPage,
  CmsCivisTaller,
  CmsCivisTallerRealizado,
  CmsCivisTalleresPage,
  CmsDocument,
} from "@/lib/cms/types";
import {
  buildCivisDoc,
  loadEditableDoc,
  newActividadId,
  newClienteId,
  newEntrenadorId,
  newOfertaId,
  newTallerRealizadoId,
  resolveQuienesCivis,
  resolveQuienesNa,
  resolveHomePrincipios,
} from "@/lib/cms/civis-display";
import {
  newCivisHeroSlideId,
  type CmsHeroCarouselItem,
} from "@/lib/cms/hero-carousel-edit";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  ImageField,
  SectionCopyFields,
} from "@/components/cms/CmsEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { matchesAppPath } from "@/lib/cms/edit-mode";
import { usePathname } from "next/navigation";
import { useCmsHydrated } from "@/lib/cms/hydration";

const LINEA_IDS = ["etica", "convivencia", "conflicto", "claridad-mental"];

const EMPTY_CIVIS_DOC: CmsDocument = {
  version: 1,
  site: "civis",
  updatedAt: "",
  sections: {},
};

function bootstrapEditableState(): EditableState {
  return loadEditableDoc(
    EMPTY_CIVIS_DOC,
    TALLERES_CIVIS,
    CIVIS_ENTRENADORES,
    CIVIS_CLIENTES,
    TALLERES_REALIZADOS,
    PROXIMAS_ACTIVIDADES,
  );
}

type EditableState = ReturnType<typeof loadEditableDoc>;

type CivisCmsEditContextValue = {
  ready: boolean;
  homeHero: EditableState["homeHero"];
  heroCarousel: CmsHeroCarouselItem[];
  homePage: CmsCivisHomePage;
  talleresPage: CmsCivisTalleresPage;
  quienesPage: CmsCivisQuienesPage;
  oferta: CmsCivisTaller[];
  entrenadores: CmsCivisEntrenador[];
  clientes: CmsCivisCliente[];
  talleresRealizados: CmsCivisTallerRealizado[];
  proximas: CmsCivisProximaActividad[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchHomeHero: (patch: EditableState["homeHero"]) => void;
  patchHeroSlide: (id: string, patch: Partial<CmsHeroCarouselItem>) => void;
  addHeroSlide: () => void;
  removeHeroSlide: (id: string) => void;
  patchHomePage: (patch: Partial<CmsCivisHomePage>) => void;
  patchHomePrincipios: (patch: Partial<CmsCivisHomePrincipios>) => void;
  patchTalleresPage: (patch: Partial<CmsCivisTalleresPage>) => void;
  patchQuienesPage: (patch: Partial<CmsCivisQuienesPage>) => void;
  patchQuienesCivis: (patch: Partial<CmsCivisQuienesCivis>) => void;
  patchQuienesNa: (patch: Partial<CmsCivisQuienesNa>) => void;
  patchOferta: (id: string, patch: Partial<CmsCivisTaller>) => void;
  patchEntrenador: (id: string, patch: Partial<CmsCivisEntrenador>) => void;
  patchCliente: (id: string, patch: Partial<CmsCivisCliente>) => void;
  patchTallerRealizado: (
    id: string,
    patch: Partial<CmsCivisTallerRealizado>,
  ) => void;
  patchProxima: (id: string, patch: Partial<CmsCivisProximaActividad>) => void;
  addTallerRealizado: () => void;
  addProxima: () => void;
  addCliente: () => void;
  addEntrenador: () => void;
  addOferta: () => void;
  removeTallerRealizado: (id: string) => void;
  removeProxima: (id: string) => void;
  removeCliente: (id: string) => void;
  removeEntrenador: (id: string) => void;
  removeOferta: (id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const CivisCmsEditContext = createContext<CivisCmsEditContextValue | null>(
  null,
);

export function useCivisCmsEdit() {
  return useContext(CivisCmsEditContext);
}

function CivisCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [baseDoc, setBaseDoc] = useState<CmsDocument | null>(null);
  const [state, setState] = useState<EditableState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const hydrated = useCmsHydrated();

  const ready = hydrated && !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoaded = useCallback((draft: CmsDocument) => {
    setBaseDoc(draft);
    setState(
      loadEditableDoc(
        draft,
        TALLERES_CIVIS,
        CIVIS_ENTRENADORES,
        CIVIS_CLIENTES,
        TALLERES_REALIZADOS,
        PROXIMAS_ACTIVIDADES,
      ),
    );
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token || !baseDoc || !state) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("civis");
      const next = buildCivisDoc(latest, state);
      await saveCmsDraft("civis", token, next);
      setBaseDoc(next);
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
  }, [token, baseDoc, state]);

  const publish = useCallback(async () => {
    if (!token || !baseDoc || !state) return;
    if (!window.confirm("¿Publicar estos cambios?")) return;
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("civis");
      const next = buildCivisDoc(latest, state);
      await saveCmsDraft("civis", token, next);
      const publishResult = await publishCms("civis", token);
      setDirty(false);
      setStatus(publishResult.message ?? "Publicado.");
} catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, baseDoc, state]);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      setToken(initToken);
      setState(bootstrapEditableState());
      fetchCmsDraft("civis")
        .then((draft) => {
          applyLoaded(draft);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "civis");
  }, [applyLoaded]);

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

  const updateState = useCallback(
    (fn: (s: EditableState) => EditableState) => {
      setState((prev) => {
        if (!prev) return prev;
        return fn(prev);
      });
      markDirty();
    },
    [markDirty],
  );

  const value: CivisCmsEditContextValue | null = state
    ? {
        ready,
        homeHero: state.homeHero,
        heroCarousel: state.heroCarousel,
        homePage: state.homePage,
        talleresPage: state.talleresPage,
        quienesPage: state.quienesPage,
        oferta: state.oferta,
        entrenadores: state.entrenadores,
        clientes: state.clientes,
        talleresRealizados: state.talleresRealizados,
        proximas: state.proximas,
        selectedId,
        setSelectedId,
        patchHomeHero: (patch) =>
          updateState((s) => ({
            ...s,
            homeHero: { ...s.homeHero, ...patch },
          })),
        patchHeroSlide: (id, patch) =>
          updateState((s) => ({
            ...s,
            heroCarousel: s.heroCarousel.map((slide) =>
              slide.id === id ? { ...slide, ...patch } : slide,
            ),
          })),
        addHeroSlide: () => {
          const slide: CmsHeroCarouselItem = {
            id: newCivisHeroSlideId(),
            src: "",
            alt: "Nueva foto del carrusel",
          };
          updateState((s) => ({
            ...s,
            heroCarousel: [...s.heroCarousel, slide],
          }));
          setSelectedId(`heroCarousel:${slide.id}`);
        },
        removeHeroSlide: (id) =>
          updateState((s) => ({
            ...s,
            heroCarousel: s.heroCarousel.filter((slide) => slide.id !== id),
          })),
        patchHomePage: (patch) =>
          updateState((s) => ({
            ...s,
            homePage: { ...s.homePage, ...patch },
          })),
        patchHomePrincipios: (patch) =>
          updateState((s) => ({
            ...s,
            homePage: {
              ...s.homePage,
              principios: { ...(s.homePage.principios ?? {}), ...patch },
            },
          })),
        patchTalleresPage: (patch) =>
          updateState((s) => ({
            ...s,
            talleresPage: { ...s.talleresPage, ...patch },
          })),
        patchQuienesPage: (patch) =>
          updateState((s) => ({
            ...s,
            quienesPage: { ...s.quienesPage, ...patch },
          })),
        patchQuienesCivis: (patch) =>
          updateState((s) => ({
            ...s,
            quienesPage: {
              ...s.quienesPage,
              civis: { ...(s.quienesPage.civis ?? {}), ...patch },
            },
          })),
        patchQuienesNa: (patch) =>
          updateState((s) => ({
            ...s,
            quienesPage: {
              ...s.quienesPage,
              nuevaAcropolis: {
                ...(s.quienesPage.nuevaAcropolis ?? {}),
                ...patch,
              },
            },
          })),
        patchOferta: (id, patch) =>
          updateState((s) => ({
            ...s,
            oferta: s.oferta.map((o) =>
              o.id === id ? { ...o, ...patch } : o,
            ),
          })),
        patchEntrenador: (id, patch) =>
          updateState((s) => ({
            ...s,
            entrenadores: s.entrenadores.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          })),
        patchCliente: (id, patch) =>
          updateState((s) => ({
            ...s,
            clientes: s.clientes.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          })),
        patchTallerRealizado: (id, patch) =>
          updateState((s) => ({
            ...s,
            talleresRealizados: s.talleresRealizados.map((t) =>
              t.id === id ? { ...t, ...patch } : t,
            ),
          })),
        patchProxima: (id, patch) =>
          updateState((s) => ({
            ...s,
            proximas: s.proximas.map((a) =>
              a.id === id ? { ...a, ...patch } : a,
            ),
          })),
        addTallerRealizado: () => {
          const item: CmsCivisTallerRealizado = {
            id: newTallerRealizadoId(),
            title: "Nuevo taller realizado",
            client: "Cliente",
            date: new Date().getFullYear().toString(),
            lineaId: "etica",
            image: { src: "", alt: "" },
          };
          updateState((s) => ({
            ...s,
            talleresRealizados: [...s.talleresRealizados, item],
          }));
          setSelectedId(`realizado:${item.id}`);
        },
        addProxima: () => {
          const item: CmsCivisProximaActividad = {
            id: newActividadId(),
            title: "Nueva actividad",
            date: "",
            startsAt: "",
            time: "",
            sede: "",
            format: "Presencial",
            excerpt: "",
            lineaId: "etica",
            image: { src: "", alt: "" },
            open: true,
          };
          updateState((s) => ({
            ...s,
            proximas: [...s.proximas, item],
          }));
          setSelectedId(`actividad:${item.id}`);
        },
        addCliente: () => {
          const item: CmsCivisCliente = {
            id: newClienteId(),
            name: "Nuevo cliente",
            logo: "",
            logoAlt: "Logo del cliente",
            logoOnDark: false,
          };
          updateState((s) => ({
            ...s,
            clientes: [...s.clientes, item],
          }));
          setSelectedId(`cliente:${item.id}`);
        },
        addEntrenador: () => {
          const item: CmsCivisEntrenador = {
            id: newEntrenadorId(),
            name: "Nuevo facilitador",
            role: "",
            bio: "",
            certifications: [],
            initials: "NF",
            featured: false,
          };
          updateState((s) => ({
            ...s,
            entrenadores: [...s.entrenadores, item],
          }));
          setSelectedId(`entrenador:${item.id}`);
        },
        addOferta: () => {
          const item: CmsCivisTaller = {
            id: newOfertaId(),
            title: "Nueva línea formativa",
            intro: "",
            topics: [],
            duration: "4 horas",
            durationLabel: "4 horas",
            durationHours: 4,
            format: "Presencial",
            maxParticipants: 25,
            image: { src: "", alt: "" },
          };
          updateState((s) => ({
            ...s,
            oferta: [...s.oferta, item],
          }));
          setSelectedId(`oferta:${item.id}`);
        },
        removeTallerRealizado: (id) =>
          updateState((s) => ({
            ...s,
            talleresRealizados: s.talleresRealizados.filter((t) => t.id !== id),
          })),
        removeProxima: (id) =>
          updateState((s) => ({
            ...s,
            proximas: s.proximas.filter((a) => a.id !== id),
          })),
        removeCliente: (id) =>
          updateState((s) => ({
            ...s,
            clientes: s.clientes.filter((c) => c.id !== id),
          })),
        removeEntrenador: (id) =>
          updateState((s) => ({
            ...s,
            entrenadores: s.entrenadores.filter((e) => e.id !== id),
          })),
        removeOferta: (id) =>
          updateState((s) => ({
            ...s,
            oferta: s.oferta.filter((o) => o.id !== id),
          })),
        saveDraft,
        publish,
        dirty,
        busy,
        token,
      }
    : null;

  const selected = selectedId;
  const edit = value;

  return (
    <CivisCmsEditContext.Provider value={value}>
      {ready ? (
        <EditToolbar
          label="Civis Consulting"
          dirty={dirty}
          busy={busy}
          status={status}
          onSave={saveDraft}
          onPublish={publish}
        />
      ) : null}
      {children}
      {edit && selected ? (
        <EditPanel selected={selected} edit={edit} onClose={() => setSelectedId(null)} status={status} busy={busy} dirty={dirty} onSave={saveDraft} />
      ) : null}
    </CivisCmsEditContext.Provider>
  );
}

function EditPanel({
  selected,
  edit,
  onClose,
  status,
  busy,
  dirty,
  onSave,
}: {
  selected: string;
  edit: CivisCmsEditContextValue;
  onClose: () => void;
  status: string;
  busy: boolean;
  dirty: boolean;
  onSave: () => void;
}) {
  if (selected === "__hero__") {
    return (
      <EditPanelChrome title="Encabezado" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Título (H1)" value={edit.homeHero.h1 ?? ""} onChange={(v) => edit.patchHomeHero({ h1: v })} />
          <EditField label="Subtítulo (H2)" value={edit.homeHero.h2 ?? ""} onChange={(v) => edit.patchHomeHero({ h2: v })} />
          <EditField label="Texto introductorio (h3)" value={edit.homeHero.lede ?? ""} onChange={(v) => edit.patchHomeHero({ lede: v })} multiline />
          <EditField label="Enlace del botón" value={edit.homeHero.ctaHref ?? ""} onChange={(v) => edit.patchHomeHero({ ctaHref: v })} />
          <EditField label="Texto del botón" value={edit.homeHero.ctaLabel ?? ""} onChange={(v) => edit.patchHomeHero({ ctaLabel: v })} />
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Fotos del carrusel</p>
            <CivisHeroCarouselList
              edit={edit}
              onSelectSlide={(id) => edit.setSelectedId(`heroCarousel:${id}`)}
            />
          </div>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__heroCarousel__") {
    return (
      <EditPanelChrome title="Carrusel de fotos del inicio" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <CivisHeroCarouselList edit={edit} onSelectSlide={(id) => edit.setSelectedId(`heroCarousel:${id}`)} />
      </EditPanelChrome>
    );
  }

  if (selected.startsWith("heroCarousel:")) {
    const slideId = selected.slice("heroCarousel:".length);
    const slide = edit.heroCarousel.find((s) => s.id === slideId);
    if (!slide) return null;
    return (
      <EditPanelChrome title="Foto del carrusel" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <CivisHeroSlideFields
          slide={slide}
          token={edit.token}
          onChange={(patch) => edit.patchHeroSlide(slideId, patch)}
          onDelete={() => {
            if (window.confirm("¿Quitar esta foto del carrusel?")) {
              edit.removeHeroSlide(slideId);
              edit.setSelectedId("__heroCarousel__");
            }
          }}
          onBack={() => edit.setSelectedId("__heroCarousel__")}
        />
      </EditPanelChrome>
    );
  }

  if (selected === "__home-principios-section__") {
    const principios = resolveHomePrincipios(edit.homePage.principios);
    const items = principios.items ?? [];
    return (
      <EditPanelChrome title="Sección — Nuestros principios" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Etiqueta" value={principios.eyebrow ?? ""} onChange={(v) => edit.patchHomePrincipios({ eyebrow: v })} />
          <EditField label="Título" value={principios.title ?? ""} onChange={(v) => edit.patchHomePrincipios({ title: v })} />
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <EditField
                label={`Principio ${i + 1} — título`}
                value={item.title}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...next[i], title: v };
                  edit.patchHomePrincipios({ items: next });
                }}
              />
              <EditField
                label="Texto"
                value={item.text}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...next[i], text: v };
                  edit.patchHomePrincipios({ items: next });
                }}
                multiline
              />
              <button
                type="button"
                className="mt-2 text-xs text-red-600"
                onClick={() => edit.patchHomePrincipios({ items: items.filter((_, j) => j !== i) })}
              >
                Eliminar principio
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() => edit.patchHomePrincipios({ items: [...items, { title: "Nuevo principio", text: "" }] })}
          >
            + Añadir principio
          </button>
          <EditField label="Texto previo al enlace" value={principios.footerLede ?? ""} onChange={(v) => edit.patchHomePrincipios({ footerLede: v })} multiline />
          <EditField label="Etiqueta del enlace" value={principios.footerLinkLabel ?? ""} onChange={(v) => edit.patchHomePrincipios({ footerLinkLabel: v })} />
          <EditField label="URL del enlace" value={principios.footerLinkHref ?? ""} onChange={(v) => edit.patchHomePrincipios({ footerLinkHref: v })} />
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__home-oferta-section__") {
    return (
      <EditPanelChrome title="Sección — Oferta (inicio)" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.homePage.oferta ?? {}} onChange={(p) => edit.patchHomePage({ oferta: { ...edit.homePage.oferta, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addOferta()}>
          + Añadir línea formativa
        </button>
      </EditPanelChrome>
    );
  }

  if (selected === "__home-actividades-section__") {
    return (
      <EditPanelChrome title="Sección — Actividades recientes" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.homePage.actividades ?? {}} onChange={(p) => edit.patchHomePage({ actividades: { ...edit.homePage.actividades, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addTallerRealizado()}>
          + Añadir taller realizado
        </button>
      </EditPanelChrome>
    );
  }

  if (selected === "__home-entrenadores-section__") {
    return (
      <EditPanelChrome title="Sección — Entrenadores (inicio)" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.homePage.entrenadores ?? {}} onChange={(p) => edit.patchHomePage({ entrenadores: { ...edit.homePage.entrenadores, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addEntrenador()}>
          + Añadir entrenador
        </button>
      </EditPanelChrome>
    );
  }

  if (selected === "__talleres-oferta-section__") {
    return (
      <EditPanelChrome title="Sección — Oferta formativa" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.talleresPage.oferta ?? {}} onChange={(p) => edit.patchTalleresPage({ oferta: { ...edit.talleresPage.oferta, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addOferta()}>
          + Añadir taller
        </button>
      </EditPanelChrome>
    );
  }

  if (selected === "__talleres-agenda-section__") {
    return (
      <EditPanelChrome title="Sección — Próximas actividades" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.talleresPage.agenda ?? {}} onChange={(p) => edit.patchTalleresPage({ agenda: { ...edit.talleresPage.agenda, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addProxima()}>
          + Añadir actividad
        </button>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-equipo-section__") {
    return (
      <EditPanelChrome title="Sección — Equipo" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.quienesPage.equipo ?? {}} onChange={(p) => edit.patchQuienesPage({ equipo: { ...edit.quienesPage.equipo, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addEntrenador()}>
          + Añadir entrenador
        </button>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-clientes-section__") {
    return (
      <EditPanelChrome title="Sección — Quienes han confiado en nosotros" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <SectionCopyFields value={edit.quienesPage.clientes ?? {}} onChange={(p) => edit.patchQuienesPage({ clientes: { ...edit.quienesPage.clientes, ...p } })} />
        <button type="button" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.addCliente()}>
          + Añadir cliente
        </button>
      </EditPanelChrome>
    );
  }

  const civisContent = resolveQuienesCivis(edit.quienesPage.civis);
  const naContent = resolveQuienesNa(edit.quienesPage.nuevaAcropolis);

  if (selected === "__quienes-civis-intro__") {
    return (
      <EditPanelChrome title="Civis — Texto introductorio" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <EditField
          label="Introducción"
          value={civisContent.intro ?? ""}
          onChange={(v) => edit.patchQuienesCivis({ intro: v })}
          multiline
        />
        <p className="mt-2 text-xs text-slate-500">
          Incluye «Nueva Acrópolis» en el texto para mantener el enlace a la pestaña correspondiente.
        </p>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-civis-proposito__") {
    const objetivos = civisContent.objetivos ?? [];
    return (
      <EditPanelChrome title="Civis — Propósito y objetivos" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Etiqueta propósito" value={civisContent.propositoEyebrow ?? ""} onChange={(v) => edit.patchQuienesCivis({ propositoEyebrow: v })} />
          <EditField label="Propósito" value={civisContent.proposito ?? ""} onChange={(v) => edit.patchQuienesCivis({ proposito: v })} multiline />
          <EditField label="Etiqueta objetivos" value={civisContent.objetivosIntro ?? ""} onChange={(v) => edit.patchQuienesCivis({ objetivosIntro: v })} />
          {objetivos.map((obj, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <EditField label={`Objetivo ${i + 1} — título`} value={obj.title} onChange={(v) => {
                const next = [...objetivos];
                next[i] = { ...next[i], title: v };
                edit.patchQuienesCivis({ objetivos: next });
              }} />
              <EditField label="Texto" value={obj.text} onChange={(v) => {
                const next = [...objetivos];
                next[i] = { ...next[i], text: v };
                edit.patchQuienesCivis({ objetivos: next });
              }} multiline />
              <button type="button" className="mt-2 text-xs text-red-600" onClick={() => edit.patchQuienesCivis({ objetivos: objetivos.filter((_, j) => j !== i) })}>
                Eliminar objetivo
              </button>
            </div>
          ))}
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.patchQuienesCivis({ objetivos: [...objetivos, { title: "Nuevo objetivo", text: "" }] })}>
            + Añadir objetivo
          </button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-civis-imagen__") {
    const img = civisContent.sideImage ?? { src: "", alt: "" };
    return (
      <EditPanelChrome title="Civis — Imagen lateral" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <ImageField
            label="Imagen"
            media={img}
            token={edit.token}
            onChange={(m) => edit.patchQuienesCivis({ sideImage: { ...img, ...m } })}
            objectPosition={img.objectPosition}
            onObjectPositionChange={(v) => edit.patchQuienesCivis({ sideImage: { ...img, objectPosition: v } })}
          />
          <EditField label="Pie de foto" value={img.caption ?? ""} onChange={(v) => edit.patchQuienesCivis({ sideImage: { ...img, caption: v } })} multiline />
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-metodologia__") {
    const items = civisContent.metodologia ?? [];
    return (
      <EditPanelChrome title="Civis — Metodología" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Etiqueta" value={civisContent.metodologiaEyebrow ?? ""} onChange={(v) => edit.patchQuienesCivis({ metodologiaEyebrow: v })} />
          <EditField label="Título (H3)" value={civisContent.metodologiaTitle ?? ""} onChange={(v) => edit.patchQuienesCivis({ metodologiaTitle: v })} />
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <EditField label={`Paso ${i + 1} — título`} value={item.title} onChange={(v) => {
                const next = [...items];
                next[i] = { ...next[i], title: v };
                edit.patchQuienesCivis({ metodologia: next });
              }} />
              <EditField label="Texto" value={item.text} onChange={(v) => {
                const next = [...items];
                next[i] = { ...next[i], text: v };
                edit.patchQuienesCivis({ metodologia: next });
              }} multiline />
              <button type="button" className="mt-2 text-xs text-red-600" onClick={() => edit.patchQuienesCivis({ metodologia: items.filter((_, j) => j !== i) })}>
                Eliminar paso
              </button>
            </div>
          ))}
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => edit.patchQuienesCivis({ metodologia: [...items, { title: "Nuevo paso", text: "" }] })}>
            + Añadir paso
          </button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-na-intro__") {
    const intro = naContent.intro ?? [];
    return (
      <EditPanelChrome title="Nueva Acrópolis — Texto" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Título" value={naContent.title ?? ""} onChange={(v) => edit.patchQuienesNa({ title: v })} />
          {intro.map((p, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <EditField
                label={`Párrafo ${i + 1}`}
                value={p}
                onChange={(v) => {
                  const next = [...intro];
                  next[i] = v;
                  edit.patchQuienesNa({ intro: next });
                }}
                multiline
              />
              <button
                type="button"
                className="mt-2 text-xs text-red-600"
                onClick={() => edit.patchQuienesNa({ intro: intro.filter((_, j) => j !== i) })}
              >
                Eliminar párrafo
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() => edit.patchQuienesNa({ intro: [...intro, ""] })}
          >
            + Añadir párrafo
          </button>
          <p className="text-xs text-slate-500">
            En el primer párrafo, la frase «Escuela de Filosofía» se resalta automáticamente en la página.
          </p>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-na-imagen__") {
    const img = naContent.heroImage ?? { src: "", alt: "" };
    return (
      <EditPanelChrome title="Nueva Acrópolis — Imagen" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <ImageField
            label="Imagen principal"
            media={img}
            token={edit.token}
            onChange={(m) => edit.patchQuienesNa({ heroImage: { ...img, ...m } })}
            objectPosition={img.objectPosition}
            onObjectPositionChange={(v) => edit.patchQuienesNa({ heroImage: { ...img, objectPosition: v } })}
          />
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-na-principios__") {
    const principios = naContent.principios ?? [];
    return (
      <EditPanelChrome title="Nueva Acrópolis — Principios" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          {principios.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <EditField
                label={`Principio ${i + 1} — título`}
                value={item.title}
                onChange={(v) => {
                  const next = [...principios];
                  next[i] = { ...next[i], title: v };
                  edit.patchQuienesNa({ principios: next });
                }}
              />
              <EditField
                label="Texto"
                value={item.text}
                onChange={(v) => {
                  const next = [...principios];
                  next[i] = { ...next[i], text: v };
                  edit.patchQuienesNa({ principios: next });
                }}
                multiline
              />
              <button
                type="button"
                className="mt-2 text-xs text-red-600"
                onClick={() => edit.patchQuienesNa({ principios: principios.filter((_, j) => j !== i) })}
              >
                Eliminar principio
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() => edit.patchQuienesNa({ principios: [...principios, { title: "Nuevo principio", text: "" }] })}
          >
            + Añadir principio
          </button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected === "__quienes-na-cta__") {
    return (
      <EditPanelChrome title="Nueva Acrópolis — Enlace" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Texto previo al botón" value={naContent.ctaIntro ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaIntro: v })} multiline />
          <EditField label="Etiqueta del botón" value={naContent.ctaLabel ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaLabel: v })} />
          <EditField label="URL del botón" value={naContent.ctaUrl ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaUrl: v })} />
        </div>
      </EditPanelChrome>
    );
  }

  if (selected.startsWith("oferta:")) {
    const id = selected.slice("oferta:".length);
    const item = edit.oferta.find((o) => o.id === id);
    if (!item) return null;
    return (
      <EditPanelChrome title={`Taller — ${item.title ?? id}`} dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Título" value={item.title ?? ""} onChange={(v) => edit.patchOferta(id, { title: v })} />
          <EditField label="Introducción" value={item.intro ?? ""} onChange={(v) => edit.patchOferta(id, { intro: v })} multiline />
          <EditField label="Duración" value={item.duration ?? ""} onChange={(v) => edit.patchOferta(id, { duration: v })} />
          <EditField label="Formato" value={item.format ?? ""} onChange={(v) => edit.patchOferta(id, { format: v })} />
          <EditField label="Máx. participantes" value={String(item.maxParticipants ?? "")} onChange={(v) => edit.patchOferta(id, { maxParticipants: Number(v) || 0 })} />
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Temas (uno por línea)</span>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={6}
              value={(item.topics ?? []).join("\n")}
              onChange={(e) => edit.patchOferta(id, { topics: e.target.value.split("\n").filter(Boolean) })}
            />
          </label>
          <ImageField
            label="Foto del taller"
            media={item.image ?? { src: "", alt: "" }}
            token={edit.token}
            onChange={(m) => edit.patchOferta(id, { image: m })}
            objectPosition={item.image?.objectPosition}
            onObjectPositionChange={(v) => edit.patchOferta(id, { image: { ...(item.image ?? { src: "", alt: "" }), objectPosition: v } })}
          />
          <button type="button" className="text-sm text-red-600" onClick={() => { edit.removeOferta(id); onClose(); }}>
            Eliminar taller
          </button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected.startsWith("realizado:")) {
    const id = selected.slice("realizado:".length);
    const item = edit.talleresRealizados.find((t) => t.id === id);
    if (!item) return null;
    return (
      <EditPanelChrome title="Taller realizado" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Título" value={item.title} onChange={(v) => edit.patchTallerRealizado(id, { title: v })} />
          <EditField label="Cliente" value={item.client} onChange={(v) => edit.patchTallerRealizado(id, { client: v })} />
          <EditField label="Fecha" value={item.date} onChange={(v) => edit.patchTallerRealizado(id, { date: v })} />
          <EditField label="Lugar" value={item.place ?? ""} onChange={(v) => edit.patchTallerRealizado(id, { place: v })} />
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Línea formativa</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={item.lineaId} onChange={(e) => edit.patchTallerRealizado(id, { lineaId: e.target.value })}>
              {LINEA_IDS.map((lid) => (
                <option key={lid} value={lid}>{lid}</option>
              ))}
            </select>
          </label>
          <ImageField label="Foto" media={item.image} token={edit.token} onChange={(m) => edit.patchTallerRealizado(id, { image: m })} objectPosition={item.image.objectPosition} onObjectPositionChange={(v) => edit.patchTallerRealizado(id, { image: { ...item.image, objectPosition: v } })} />
          <button type="button" className="text-sm text-red-600" onClick={() => { edit.removeTallerRealizado(id); onClose(); }}>Eliminar</button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected.startsWith("actividad:")) {
    const id = selected.slice("actividad:".length);
    const item = edit.proximas.find((a) => a.id === id);
    if (!item) return null;
    return (
      <EditPanelChrome title="Próxima actividad" dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Título" value={item.title} onChange={(v) => edit.patchProxima(id, { title: v })} />
          <div className="grid gap-2 sm:grid-cols-2">
            <EditField label="Fecha de inicio (ISO)" value={item.startsAt ?? ""} onChange={(v) => edit.patchProxima(id, { startsAt: v })} />
            <EditField label="Fecha visible" value={item.date} onChange={(v) => edit.patchProxima(id, { date: v })} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <EditField label="Hora" value={item.time ?? ""} onChange={(v) => edit.patchProxima(id, { time: v })} />
            <EditField label="Ubicación / sede" value={item.sede ?? ""} onChange={(v) => edit.patchProxima(id, { sede: v })} />
          </div>
          <EditField label="Formato" value={item.format} onChange={(v) => edit.patchProxima(id, { format: v })} />
          <EditField label="Resumen" value={item.excerpt} onChange={(v) => edit.patchProxima(id, { excerpt: v })} multiline />
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Línea formativa</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={item.lineaId} onChange={(e) => edit.patchProxima(id, { lineaId: e.target.value })}>
              {LINEA_IDS.map((lid) => (
                <option key={lid} value={lid}>{lid}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={item.open} onChange={(e) => edit.patchProxima(id, { open: e.target.checked })} />
            Abierto a inscripción
          </label>
          <ImageField label="Foto" media={item.image} token={edit.token} onChange={(m) => edit.patchProxima(id, { image: m })} objectPosition={item.image.objectPosition} onObjectPositionChange={(v) => edit.patchProxima(id, { image: { ...item.image, objectPosition: v } })} />
          <button type="button" className="text-sm text-red-600" onClick={() => { edit.removeProxima(id); onClose(); }}>Eliminar</button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected.startsWith("cliente:")) {
    const id = selected.slice("cliente:".length);
    const item = edit.clientes.find((c) => c.id === id);
    if (!item) return null;
    return (
      <EditPanelChrome title={`Cliente — ${item.name ?? id}`} dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Nombre" value={item.name ?? ""} onChange={(v) => edit.patchCliente(id, { name: v, logoAlt: item.logoAlt || v })} />
          <EditField label="URL del logo" value={item.logo ?? ""} onChange={(v) => edit.patchCliente(id, { logo: v })} />
          <EditField label="Texto alternativo del logo" value={item.logoAlt ?? ""} onChange={(v) => edit.patchCliente(id, { logoAlt: v })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!item.logoOnDark} onChange={(e) => edit.patchCliente(id, { logoOnDark: e.target.checked })} />
            Fondo oscuro (logo claro / blanco)
          </label>
          {edit.token ? (
            <label className="block text-sm">
              <span className="font-semibold text-slate-700">Subir logo</span>
              <input
                type="file"
                accept="image/*,.svg"
                className="mt-1 block text-sm"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f || !edit.token) return;
                  const { uploadCmsImage } = await import("@/lib/cms/api-client");
                  const url = await uploadCmsImage("civis", edit.token, f);
                  edit.patchCliente(id, { logo: url });
                }}
              />
            </label>
          ) : null}
          {item.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveCmsMediaUrl(item.logo) ?? item.logo}
              alt={item.logoAlt || "Vista previa del logo"}
              className="max-h-24 w-full rounded-lg object-contain bg-slate-50 p-2"
            />
          ) : null}
          <button type="button" className="text-sm text-red-600" onClick={() => { edit.removeCliente(id); onClose(); }}>
            Eliminar cliente
          </button>
        </div>
      </EditPanelChrome>
    );
  }

  if (selected.startsWith("entrenador:")) {
    const id = selected.slice("entrenador:".length);
    const item = edit.entrenadores.find((e) => e.id === id);
    if (!item) return null;
    return (
      <EditPanelChrome title={`Entrenador — ${item.name ?? id}`} dirty={dirty} busy={busy} status={status} onClose={onClose} onSave={onSave}>
        <div className="space-y-4">
          <EditField label="Nombre" value={item.name ?? ""} onChange={(v) => edit.patchEntrenador(id, { name: v })} />
          <EditField label="Cargo" value={item.role ?? ""} onChange={(v) => edit.patchEntrenador(id, { role: v })} />
          <EditField label="Biografía" value={item.bio ?? ""} onChange={(v) => edit.patchEntrenador(id, { bio: v })} multiline />
          <EditField label="Iniciales (sin foto)" value={item.initials ?? ""} onChange={(v) => edit.patchEntrenador(id, { initials: v })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!item.featured} onChange={(e) => edit.patchEntrenador(id, { featured: e.target.checked })} />
            Destacado en inicio
          </label>
          <EditField label="URL foto" value={item.photo ?? ""} onChange={(v) => edit.patchEntrenador(id, { photo: v })} />
          <EditField label="Alt foto" value={item.photoAlt ?? ""} onChange={(v) => edit.patchEntrenador(id, { photoAlt: v })} />
          <EditField label="Encuadre foto" value={item.photoObjectPosition ?? ""} onChange={(v) => edit.patchEntrenador(id, { photoObjectPosition: v })} />
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Certificaciones (una por línea)</span>
            <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={5} value={(item.certifications ?? []).join("\n")} onChange={(e) => edit.patchEntrenador(id, { certifications: e.target.value.split("\n").filter(Boolean) })} />
          </label>
          {edit.token ? (
            <label className="block text-sm">
              <span className="font-semibold text-slate-700">Subir foto</span>
              <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f || !edit.token) return;
                const { uploadCmsImage } = await import("@/lib/cms/api-client");
                const url = await uploadCmsImage("civis", edit.token, f);
                edit.patchEntrenador(id, { photo: url });
              }} />
            </label>
          ) : null}
          {item.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveCmsMediaUrl(item.photo) ?? item.photo}
              alt={item.photoAlt || "Vista previa"}
              className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-na-civis/10"
              style={{ objectPosition: item.photoObjectPosition ?? "center 22%" }}
            />
          ) : null}
          <button type="button" className="text-sm text-red-600" onClick={() => { edit.removeEntrenador(id); onClose(); }}>
            Eliminar entrenador
          </button>
        </div>
      </EditPanelChrome>
    );
  }

  return null;
}

function CivisHeroCarouselList({
  edit,
  onSelectSlide,
}: {
  edit: CivisCmsEditContextValue;
  onSelectSlide: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Haz clic en una foto para cambiar la ruta, subir una imagen o quitarla.
      </p>
      <ul className="grid grid-cols-2 gap-2">
        {edit.heroCarousel.map((slide, i) => {
          const src = resolveCmsMediaUrl(slide.src) ?? slide.src;
          return (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => onSelectSlide(slide.id)}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={slide.alt || `Foto ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-slate-400">
                    Sin imagen
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => edit.addHeroSlide()}
        className="w-full rounded-lg border-2 border-dashed border-[#3e48a1]/40 py-3 text-sm font-bold text-[#3e48a1]"
      >
        + Añadir foto
      </button>
    </div>
  );
}

function CivisHeroSlideFields({
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
        className="text-sm font-semibold text-[#3e48a1] hover:underline"
      >
        ← Volver al listado
      </button>
      <ImageField
        label="Imagen"
        media={{ src: slide.src, alt: slide.alt }}
        token={token}
        onChange={(m) => onChange({ src: m.src, alt: m.alt })}
      />
      {!slide.src?.trim() ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Esta foto aún no tiene imagen. Usa el campo <strong>Ruta de la imagen</strong> o
          sube un archivo <strong>WebP</strong>. Las fotos vacías no aparecen en el carrusel.
        </p>
      ) : null}
      <EditField
        label="Encuadre (object-position)"
        value={slide.objectPosition ?? ""}
        onChange={(v) => onChange({ objectPosition: v || undefined })}
      />
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

export function CivisCmsEditProvider({ children }: { children: ReactNode }) {
  const mode = useCmsEditMode();
  const pathname = usePathname();
  if (mode !== "1") return <>{children}</>;
  // En /salones la edición la maneja SalonesCmsEditContext (evita doble toolbar y carreras al guardar).
  if (matchesAppPath(pathname, "/salones")) return <>{children}</>;
  return <CivisCmsEditInner>{children}</CivisCmsEditInner>;
}
