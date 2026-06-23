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
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";
import { useCmsEditorEmbedded } from "@/hooks/useCmsEditorEmbedded";
import { usePathname } from "next/navigation";
import { DIPLOMADO_PROXIMAS_SESIONES } from "@/lib/diplomado-sessions";
import {
  getDiplomadoEntries,
  mergeDiplomadoIntoDoc,
} from "@/lib/cms/agenda-edit";
import {
  fetchCmsDraft,
  publishCms,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type {
  CmsAgendaEntry,
  CmsDiplomadoHero,
  CmsDiplomadoInscription,
  CmsDiplomadoPage,
  CmsDocument,
  CmsFilosofiaCard,
  CmsFilosofiaFaqItem,
  CmsFilosofiaPage,
} from "@/lib/cms/types";
import {
  DIPLOMADO_INSCRIBE_WHATSAPP,
  DIPLOMADO_INSCRIPTION,
  DIPLOMADO_TESTIMONIAL,
} from "@/lib/diplomado-content";
import { DEFAULT_FILOSOFIA_PAGE_BODY } from "@/lib/filosofia-content";
import {
  mergeFilosofiaCards,
  mergeFilosofiaFaq,
} from "@/lib/cms/filosofia-display";
import {
  FILOSOFIA_ES_PARA_TI_DEFAULTS,
  FILOSOFIA_MODULOS_DEFAULTS,
  FILOSOFIA_TEMARIO_DEFAULTS,
} from "@/lib/filosofia-content";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import {
  FilosofiaAvanzadosPanel,
  FilosofiaCtaPanel,
  FilosofiaCursoPanel,
  FilosofiaEsParaTiPanel,
  FilosofiaProgramaPanel,
  FilosofiaTemarioPanel,
} from "@/components/filosofia/cms/FilosofiaPageCmsPanels";

export type FilosofiaPageContent = CmsFilosofiaPage;

export type FilosofiaEditSection =
  | "hero"
  | "programa"
  | "curso"
  | "temario"
  | "avanzados"
  | "esParaTi"
  | "cta"
  | "intro"
  | "badge"
  | "inscripcion"
  | "sesiones"
  | "otras";

type FilosofiaCmsEditContextValue = {
  ready: boolean;
  token: string | null;
  dirty: boolean;
  busy: boolean;
  status: string;
  activeSection: FilosofiaEditSection | null;
  setActiveSection: (s: FilosofiaEditSection | null) => void;
  filosofiaPage: FilosofiaPageContent;
  patchFilosofiaPage: (patch: Partial<FilosofiaPageContent>) => void;
  patchFilosofiaCard: (
    field: "modulos" | "temario",
    id: string,
    patch: Partial<CmsFilosofiaCard>,
  ) => void;
  patchFilosofiaFaq: (id: string, patch: Partial<CmsFilosofiaFaqItem>) => void;
  selectedFilosofiaSubId: string | null;
  setSelectedFilosofiaSubId: (id: string | null) => void;
  diplomadoHero: CmsDiplomadoHero;
  patchDiplomadoHero: (patch: Partial<CmsDiplomadoHero>) => void;
  diplomadoInscription: CmsDiplomadoInscription;
  patchDiplomadoInscription: (patch: Partial<CmsDiplomadoInscription>) => void;
  diplomadoPage: CmsDiplomadoPage;
  patchDiplomadoPage: (patch: Partial<CmsDiplomadoPage>) => void;
  diplomadoAgenda: CmsAgendaEntry[];
  otrasAgenda: CmsAgendaEntry[];
  patchAgendaEntry: (id: string, patch: Partial<CmsAgendaEntry>) => void;
  addAgendaEntry: (category: CmsAgendaEntry["category"]) => void;
  deleteAgendaEntry: (id: string) => void;
  selectedAgendaId: string | null;
  setSelectedAgendaId: (id: string | null) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  markDirty: () => void;
  scrollToSection: (id: string) => void;
};

const FilosofiaCmsEditContext =
  createContext<FilosofiaCmsEditContextValue | null>(null);

export function useFilosofiaCmsEdit() {
  const ctx = useContext(FilosofiaCmsEditContext);
  return ctx;
}

export function useFilosofiaCmsEditRequired() {
  const ctx = useFilosofiaCmsEdit();
  if (!ctx) throw new Error("FilosofiaCmsEditProvider required");
  return ctx;
}

const DEFAULT_FILOSOFIA_PAGE: FilosofiaPageContent = {
  heroEyebrow: "Filosofía",
  heroTitle: "Escuela de Filosofía a la manera clásica",
  heroLede:
    "Un espacio para pensar, conocerse y vivir mejor. La filosofía no como teoría abstracta, sino como una forma práctica de afrontar la vida.",
  sesionesTitle: "Próximas sesiones",
  sesionesIntro:
    "Algunas de nuestras próximas clases, charlas y encuentros en las distintas sedes.",
  ...DEFAULT_FILOSOFIA_PAGE_BODY,
};

const DEFAULT_DIPLOMADO_PAGE: CmsDiplomadoPage = {
  heroLede:
    "Un viaje de 5 meses por las grandes tradiciones filosóficas del mundo para transformar tu manera de pensar, sentir y actuar.",
  otrasSesionesTitle: "Cupos disponibles",
  otrasSesionesIntro: "",
  testimonialEyebrow: DIPLOMADO_TESTIMONIAL.eyebrow,
  testimonialQuote: DIPLOMADO_TESTIMONIAL.quote,
  testimonialVideoUrl: DIPLOMADO_TESTIMONIAL.videoUrl,
};

const DEFAULT_DIPLOMADO_INSCRIPTION: CmsDiplomadoInscription = {
  eyebrow: DIPLOMADO_INSCRIPTION.eyebrow,
  title: DIPLOMADO_INSCRIPTION.title,
  intro: DIPLOMADO_INSCRIPTION.intro,
  capacityNote: DIPLOMADO_INSCRIPTION.capacityNote,
  feeMain: DIPLOMADO_INSCRIPTION.feeMain,
  feeNote: DIPLOMADO_INSCRIPTION.feeNote,
  paymentNote: DIPLOMADO_INSCRIPTION.paymentNote,
  accountLabel: DIPLOMADO_INSCRIPTION.accountLabel,
  account: DIPLOMADO_INSCRIPTION.account,
  rncLabel: DIPLOMADO_INSCRIPTION.rncLabel,
  rnc: DIPLOMADO_INSCRIPTION.rnc,
  email: DIPLOMADO_INSCRIPTION.email,
  footnote: DIPLOMADO_INSCRIPTION.footnote,
  inscribeWhatsApp: DIPLOMADO_INSCRIBE_WHATSAPP,
};

function splitAgenda(doc: CmsDocument) {
  const all = doc.sections.agenda ?? [];
  const diplomado = getDiplomadoEntries(doc, DIPLOMADO_PROXIMAS_SESIONES);
  const otras = all.filter((e) => e.category !== "diplomado");
  return { diplomado, otras };
}

function buildDoc(
  base: CmsDocument,
  filosofiaPage: FilosofiaPageContent,
  diplomadoHero: CmsDiplomadoHero,
  diplomadoInscription: CmsDiplomadoInscription,
  diplomadoPage: CmsDiplomadoPage,
  diplomado: CmsAgendaEntry[],
  otras: CmsAgendaEntry[],
): CmsDocument {
  const withAgenda = mergeDiplomadoIntoDoc(base, diplomado);
  return mergeHeroCarouselsIntoDoc({
    ...withAgenda,
    sections: {
      ...withAgenda.sections,
      filosofiaPage,
      diplomadoHero,
      diplomadoInscription,
      diplomadoPage,
      agenda: [...otras, ...diplomado],
    },
  });
}

function FilosofiaCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [filosofiaPage, setFilosofiaPage] = useState<FilosofiaPageContent>(
    DEFAULT_FILOSOFIA_PAGE,
  );
  const [diplomadoHero, setDiplomadoHero] = useState<CmsDiplomadoHero>({});
  const [diplomadoInscription, setDiplomadoInscription] =
    useState<CmsDiplomadoInscription>(DEFAULT_DIPLOMADO_INSCRIPTION);
  const [diplomadoPage, setDiplomadoPage] =
    useState<CmsDiplomadoPage>(DEFAULT_DIPLOMADO_PAGE);
  const [diplomadoAgenda, setDiplomadoAgenda] = useState<CmsAgendaEntry[]>([]);
  const [otrasAgenda, setOtrasAgenda] = useState<CmsAgendaEntry[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [activeSection, setActiveSection] =
    useState<FilosofiaEditSection | null>(null);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [selectedFilosofiaSubId, setSelectedFilosofiaSubId] = useState<
    string | null
  >(null);

  const ready = !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setDoc(draft);
    const fp = draft.sections.filosofiaPage ?? {};
    setFilosofiaPage({ ...DEFAULT_FILOSOFIA_PAGE, ...fp });
    setDiplomadoHero(draft.sections.diplomadoHero ?? {});
    setDiplomadoInscription({
      ...DEFAULT_DIPLOMADO_INSCRIPTION,
      ...draft.sections.diplomadoInscription,
    });
    setDiplomadoPage({
      ...DEFAULT_DIPLOMADO_PAGE,
      ...draft.sections.diplomadoPage,
    });
    const { diplomado, otras } = splitAgenda(draft);
    setDiplomadoAgenda(diplomado);
    setOtrasAgenda(otras);
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const getBuiltDoc = useCallback(() => {
    if (!doc) return null;
    return buildDoc(
      doc,
      filosofiaPage,
      diplomadoHero,
      diplomadoInscription,
      diplomadoPage,
      diplomadoAgenda,
      otrasAgenda,
    );
  }, [
    doc,
    filosofiaPage,
    diplomadoHero,
    diplomadoInscription,
    diplomadoPage,
    diplomadoAgenda,
    otrasAgenda,
  ]);

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
      setStatus("Borrador guardado en el servidor.");
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
    if (!token || !doc) return;
    if (
      !window.confirm(
        "¿Publicar? Los visitantes verán estos cambios. Se guarda un respaldo automático.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("Publicando…");
    const next = getBuiltDoc();
    if (!next) return;
    try {
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
  }, [token, doc, getBuiltDoc]);

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

  const patchFilosofiaPage = useCallback(
    (patch: Partial<FilosofiaPageContent>) => {
      setFilosofiaPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchFilosofiaCard = useCallback(
    (
      field: "modulos" | "temario",
      id: string,
      patch: Partial<CmsFilosofiaCard>,
    ) => {
      setFilosofiaPage((p) => {
        const defaults =
          field === "modulos" ? FILOSOFIA_MODULOS_DEFAULTS : FILOSOFIA_TEMARIO_DEFAULTS;
        const merged = mergeFilosofiaCards(defaults, p[field]);
        const next = merged.map((card) =>
          card.id === id ? { ...card, ...patch } : card,
        );
        return { ...p, [field]: next };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchFilosofiaFaq = useCallback(
    (id: string, patch: Partial<CmsFilosofiaFaqItem>) => {
      setFilosofiaPage((p) => {
        const merged = mergeFilosofiaFaq(
          FILOSOFIA_ES_PARA_TI_DEFAULTS.items.map((x) => ({ ...x })),
          p.esParaTi,
        );
        const next = merged.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        );
        return { ...p, esParaTi: next };
      });
      markDirty();
    },
    [markDirty],
  );

  const patchDiplomadoHero = useCallback(
    (patch: Partial<CmsDiplomadoHero>) => {
      setDiplomadoHero((h) => ({ ...h, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchDiplomadoInscription = useCallback(
    (patch: Partial<CmsDiplomadoInscription>) => {
      setDiplomadoInscription((ins) => ({ ...ins, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchDiplomadoPage = useCallback(
    (patch: Partial<CmsDiplomadoPage>) => {
      setDiplomadoPage((p) => ({ ...p, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const patchAgendaEntry = useCallback(
    (id: string, patch: Partial<CmsAgendaEntry>) => {
      setDiplomadoAgenda((list) => {
        if (!list.some((e) => e.id === id)) return list;
        return list.map((e) => (e.id === id ? { ...e, ...patch } : e));
      });
      setOtrasAgenda((list) => {
        if (!list.some((e) => e.id === id)) return list;
        return list.map((e) => (e.id === id ? { ...e, ...patch } : e));
      });
      markDirty();
    },
    [markDirty],
  );

  const addAgendaEntry = useCallback(
    (category: CmsAgendaEntry["category"]) => {
      const entry: CmsAgendaEntry = {
        id: `agenda-${Date.now().toString(36)}`,
        category,
        title:
          category === "diplomado"
            ? "Diplomado de Filosofía para la Vida"
            : category === "filosofia"
              ? "Nueva actividad de filosofía"
              : "Nueva actividad",
        startsAt: new Date().toISOString().slice(0, 10),
        date: "",
        time: "",
        sede: "",
        tag:
          category === "diplomado"
            ? "Cupos abiertos"
            : category === "filosofia"
              ? "Filosofía"
              : "Abierta y gratuita",
        showOnHome: true,
        detailHref:
          category === "diplomado" || category === "filosofia"
            ? "/filosofia"
            : "/cursos",
        detailLabel:
          category === "diplomado"
            ? "Ver programa completo"
            : category === "filosofia"
              ? "Ver Escuela de Filosofía"
              : "Ver cursos y conferencias",
        image: undefined,
        imageAlt: "",
      };
      if (category === "diplomado") {
        setDiplomadoAgenda((list) => [...list, entry]);
      } else {
        setOtrasAgenda((list) => [...list, entry]);
      }
      setSelectedAgendaId(entry.id);
      markDirty();
    },
    [markDirty],
  );

  const deleteAgendaEntry = useCallback(
    (id: string) => {
      setDiplomadoAgenda((list) => list.filter((e) => e.id !== id));
      setOtrasAgenda((list) => list.filter((e) => e.id !== id));
      setSelectedAgendaId(null);
      markDirty();
    },
    [markDirty],
  );

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    (): FilosofiaCmsEditContextValue => ({
      ready,
      token,
      dirty,
      busy,
      status,
      activeSection,
      setActiveSection,
      filosofiaPage,
      patchFilosofiaPage,
      patchFilosofiaCard,
      patchFilosofiaFaq,
      selectedFilosofiaSubId,
      setSelectedFilosofiaSubId,
      diplomadoHero,
      patchDiplomadoHero,
      diplomadoInscription,
      patchDiplomadoInscription,
      diplomadoPage,
      patchDiplomadoPage,
      diplomadoAgenda,
      otrasAgenda,
      patchAgendaEntry,
      addAgendaEntry,
      deleteAgendaEntry,
      selectedAgendaId,
      setSelectedAgendaId,
      saveDraft,
      publish,
      markDirty,
      scrollToSection,
    }),
    [
      ready,
      token,
      dirty,
      busy,
      status,
      activeSection,
      filosofiaPage,
      patchFilosofiaPage,
      patchFilosofiaCard,
      patchFilosofiaFaq,
      selectedFilosofiaSubId,
      setSelectedFilosofiaSubId,
      diplomadoHero,
      patchDiplomadoHero,
      diplomadoInscription,
      patchDiplomadoInscription,
      diplomadoPage,
      patchDiplomadoPage,
      diplomadoAgenda,
      otrasAgenda,
      patchAgendaEntry,
      addAgendaEntry,
      deleteAgendaEntry,
      selectedAgendaId,
      saveDraft,
      publish,
      markDirty,
      scrollToSection,
    ],
  );

  return (
    <FilosofiaCmsEditContext.Provider value={value}>
      <FilosofiaEditToolbar />
      {!ready ? (
        <div className="bg-amber-50 py-3 text-center text-sm text-na-muted">
          Conectando con el editor…
        </div>
      ) : null}
      {children}
      <FilosofiaEditPanels />
    </FilosofiaCmsEditContext.Provider>
  );
}

const FILOSOFIA_SECTIONS: { id: FilosofiaEditSection; label: string; anchor: string }[] = [
  { id: "hero", label: "Encabezado", anchor: "filosofia-hero" },
  { id: "programa", label: "Programa", anchor: "programa-estudios" },
  { id: "curso", label: "Curso intro", anchor: "curso-introductorio" },
  { id: "temario", label: "Temario", anchor: "temario" },
  { id: "avanzados", label: "Avanzados", anchor: "cursos-avanzados" },
  { id: "esParaTi", label: "¿Es para ti?", anchor: "es-para-ti" },
  { id: "cta", label: "Inscripción", anchor: "inscripcion-cta" },
  { id: "badge", label: "Badge diplomado", anchor: "filosofia-badge" },
  { id: "sesiones", label: "Sesiones diplomado", anchor: "proximas-sesiones" },
  { id: "otras", label: "Otras actividades (home)", anchor: "otras-actividades" },
];

const DIPLOMADO_SECTIONS: { id: FilosofiaEditSection; label: string; anchor: string }[] = [
  { id: "intro", label: "Texto hero", anchor: "diplomado-hero-copy" },
  { id: "badge", label: "Badge y fechas", anchor: "diplomado-hero" },
  { id: "inscripcion", label: "Inscripción", anchor: "inscripcion" },
  { id: "sesiones", label: "Cupos disponibles", anchor: "otras-sesiones" },
];

function FilosofiaEditToolbar() {
  const embeddedInEditor = useCmsEditorEmbedded();
  const ctx = useFilosofiaCmsEditRequired();
  const pathname = usePathname();
  const onDiplomado = pathname.startsWith("/diplomado");
  const sections = onDiplomado ? DIPLOMADO_SECTIONS : FILOSOFIA_SECTIONS;
  const pageLabel = onDiplomado ? "Diplomado" : "Filosofía";

  if (embeddedInEditor) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2">
        <p className="text-xs font-semibold text-amber-950 sm:text-sm">
          Modo edición — {pageLabel}
          {ctx.dirty ? (
            <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Sin guardar
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={!ctx.ready || ctx.busy}
            onClick={() => void ctx.saveDraft()}
            className="rounded-lg bg-na-heket px-3 py-1.5 text-xs font-bold text-white hover:bg-na-heketDark disabled:opacity-50 sm:text-sm"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={!ctx.ready || ctx.busy}
            onClick={() => void ctx.publish()}
            className="rounded-lg bg-na-helios px-3 py-1.5 text-xs font-bold text-na-ink hover:brightness-105 disabled:opacity-50 sm:text-sm"
          >
            Publicar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-t border-amber-200/80 px-2 py-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!ctx.ready}
            onClick={() => {
              ctx.scrollToSection(s.anchor);
              ctx.setSelectedAgendaId(null);
              ctx.setSelectedFilosofiaSubId(null);
              ctx.setActiveSection(s.id);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              ctx.activeSection === s.id
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-950 ring-1 ring-amber-200 hover:bg-amber-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {ctx.status ? (
        <p className="border-t border-amber-100 px-3 py-1 text-center text-xs text-amber-800">
          {ctx.status}
        </p>
      ) : (
        <p className="border-t border-amber-100 px-3 py-1 text-center text-[11px] text-amber-700">
          Edita y pulsa <strong>Guardar borrador</strong> para conservar los cambios.
        </p>
      )}
    </div>
  );
}

function FilosofiaEditPanels() {
  const ctx = useFilosofiaCmsEditRequired();
  const pathname = usePathname();
  const sections = pathname.startsWith("/diplomado")
    ? DIPLOMADO_SECTIONS
    : FILOSOFIA_SECTIONS;
  if (!ctx.activeSection) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-na-ink/40"
        aria-label="Cerrar"
        onClick={() => ctx.setActiveSection(null)}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <PanelHeader
          title={
            sections.find((s) => s.id === ctx.activeSection)?.label ?? "Editar"
          }
          onClose={() => ctx.setActiveSection(null)}
        />
        <div className="flex-1 overflow-y-auto p-4">
          {ctx.activeSection === "hero" ? <HeroPanel /> : null}
          {ctx.activeSection === "programa" ? <FilosofiaProgramaPanel /> : null}
          {ctx.activeSection === "curso" ? <FilosofiaCursoPanel /> : null}
          {ctx.activeSection === "temario" ? <FilosofiaTemarioPanel /> : null}
          {ctx.activeSection === "avanzados" ? <FilosofiaAvanzadosPanel /> : null}
          {ctx.activeSection === "esParaTi" ? <FilosofiaEsParaTiPanel /> : null}
          {ctx.activeSection === "cta" ? <FilosofiaCtaPanel /> : null}
          {ctx.activeSection === "intro" ? <DiplomadoIntroPanel /> : null}
          {ctx.activeSection === "badge" ? <BadgePanel /> : null}
          {ctx.activeSection === "inscripcion" ? <InscriptionPanel /> : null}
          {ctx.activeSection === "sesiones" ? (
            <AgendaPanel mode="diplomado" />
          ) : null}
          {ctx.activeSection === "otras" ? (
            <AgendaPanel mode="otras" />
          ) : null}
        </div>
        <PanelFooter onClose={() => ctx.setActiveSection(null)} />
      </aside>
    </div>
  );
}

function PanelHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <h3 className="font-bold text-na-heketDark">{title}</h3>
      <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
        ✕
      </button>
    </div>
  );
}

function PanelFooter({ onClose }: { onClose: () => void }) {
  const ctx = useFilosofiaCmsEditRequired();
  return (
    <div className="space-y-2 border-t bg-slate-50 p-4">
      {ctx.dirty ? (
        <p className="text-center text-xs text-amber-700">
          Tienes cambios locales. Pulsa guardar para escribirlos en el servidor.
        </p>
      ) : (
        <p className="text-center text-xs text-slate-500">Todo guardado en borrador.</p>
      )}
      <button
        type="button"
        disabled={ctx.busy}
        onClick={() => void ctx.saveDraft()}
        className="w-full rounded-lg bg-na-heket py-3 text-sm font-bold text-white hover:bg-na-heketDark disabled:opacity-50"
      >
        {ctx.busy ? "Guardando…" : "Guardar borrador"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-lg border py-2 text-sm font-medium text-slate-600 hover:bg-white"
      >
        Cerrar panel
      </button>
    </div>
  );
}

function HeroPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior (ej. Filosofía)"
        value={p.heroEyebrow ?? ""}
        onChange={(v) => ctx.patchFilosofiaPage({ heroEyebrow: v })}
      />
      <EditField
        label="Título principal (h1)"
        value={p.heroTitle ?? ""}
        onChange={(v) => ctx.patchFilosofiaPage({ heroTitle: v })}
      />
      <EditField
        label="Texto introductorio (h3)"
        value={p.heroLede ?? ""}
        onChange={(v) => ctx.patchFilosofiaPage({ heroLede: v })}
        multiline
      />
    </div>
  );
}

function BadgePanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const h = ctx.diplomadoHero;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Sesión principal del Diplomado: badge del collage, franja blanca bajo el
        hero e inscripción. Los mismos datos aparecen en /diplomado y en
        Filosofía.
      </p>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Badge sobre el collage
      </p>
      <EditField
        label="Día del badge (ej. Lunes)"
        value={h.badgeWeekday ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ badgeWeekday: v })}
      />
      <EditField
        label="Fecha corta del badge (ej. 29 JUN)"
        value={h.badgeDate ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ badgeDate: v })}
      />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Franja blanca e inscripción
      </p>
      <EditField
        label="Fecha de inicio (legible, ej. Lunes 29 de junio)"
        value={h.activeDate ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ activeDate: v })}
      />
      <EditField
        label="Horario (ej. 7:00 p.m. – 9:15 p.m.)"
        value={h.activeTime ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ activeTime: v })}
      />
      <EditField
        label="Modalidad (ej. Presencial)"
        value={h.activeModality ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ activeModality: v })}
      />
      <EditField
        label="Duración (ej. 4 Meses)"
        value={h.bannerDuration ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ bannerDuration: v })}
      />
      <EditField
        label="Inversión en franja blanca (ej. RD$ 2,500)"
        value={h.bannerFee ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ bannerFee: v })}
      />
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Los cuadros de <strong>Inicio, Horario, Modalidad y Duración</strong> bajo
        «¿Quieres unirte a esta aventura?» usan los mismos campos de fecha, horario,
        modalidad y duración de arriba.
      </p>
      <EditField
        label="Etiqueta sesión activa (opcional)"
        value={h.activeLabel ?? ""}
        onChange={(v) => ctx.patchDiplomadoHero({ activeLabel: v })}
      />
    </div>
  );
}

function DiplomadoIntroPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.diplomadoPage;
  const ins = ctx.diplomadoInscription;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Texto bajo el título «Filosofía para la Vida» y mensaje de WhatsApp del botón
        del hero.
      </p>
      <EditField
        label="Texto introductorio del hero (h3)"
        value={p.heroLede ?? ""}
        onChange={(v) => ctx.patchDiplomadoPage({ heroLede: v })}
        multiline
      />
      <EditField
        label="Mensaje WhatsApp (botón de inscripción)"
        value={ins.inscribeWhatsApp ?? ""}
        onChange={(v) => ctx.patchDiplomadoInscription({ inscribeWhatsApp: v })}
        multiline
      />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Tarjeta de testimonio (video)
      </p>
      <EditField
        label="Etiqueta (ej. Como tú)"
        value={p.testimonialEyebrow ?? ""}
        onChange={(v) => ctx.patchDiplomadoPage({ testimonialEyebrow: v })}
      />
      <EditField
        label="Frase o cita"
        value={p.testimonialQuote ?? ""}
        onChange={(v) => ctx.patchDiplomadoPage({ testimonialQuote: v })}
        multiline
      />
      <EditField
        label="URL de YouTube (opcional)"
        value={p.testimonialVideoUrl ?? ""}
        onChange={(v) => ctx.patchDiplomadoPage({ testimonialVideoUrl: v })}
      />
    </div>
  );
}

function InscriptionPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const ins = ctx.diplomadoInscription;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Bloque «¿Quieres unirte a esta aventura?» — aviso de cupo, texto introductorio y
        botón de WhatsApp.
      </p>
      <EditField
        label="Etiqueta superior"
        value={ins.eyebrow ?? ""}
        onChange={(v) => ctx.patchDiplomadoInscription({ eyebrow: v })}
      />
      <EditField
        label="Título"
        value={ins.title ?? ""}
        onChange={(v) => ctx.patchDiplomadoInscription({ title: v })}
      />
      <EditField
        label="Aviso de cupo"
        value={ins.capacityNote ?? ""}
        onChange={(v) => ctx.patchDiplomadoInscription({ capacityNote: v })}
      />
      <EditField
        label="Introducción"
        value={ins.intro ?? ""}
        onChange={(v) => ctx.patchDiplomadoInscription({ intro: v })}
        multiline
      />
      <EditField
        label="Mensaje WhatsApp"
        value={ins.inscribeWhatsApp ?? ""}
        onChange={(v) => ctx.patchDiplomadoInscription({ inscribeWhatsApp: v })}
        multiline
      />
    </div>
  );
}

function AgendaPanel({ mode }: { mode: "diplomado" | "otras" }) {
  const ctx = useFilosofiaCmsEditRequired();
  const pathname = usePathname();
  const onDiplomado = pathname.startsWith("/diplomado");
  const list = mode === "diplomado" ? ctx.diplomadoAgenda : ctx.otrasAgenda;
  const selected = list.find((e) => e.id === ctx.selectedAgendaId);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {mode === "diplomado"
          ? "Sesiones del Diplomado en esta página y en Filosofía."
          : "Conferencias, cursos y talleres que rotan en el carrusel del home."}
      </p>
      {mode === "diplomado" ? (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
            {onDiplomado
              ? "Título del bloque «Cupos disponibles»"
              : "Título del bloque «Próximas sesiones»"}
          </p>
          {onDiplomado ? (
            <>
              <EditField
                label="Título de la sección"
                value={ctx.diplomadoPage.otrasSesionesTitle ?? ""}
                onChange={(v) =>
                  ctx.patchDiplomadoPage({ otrasSesionesTitle: v })
                }
              />
              <EditField
                label="Texto introductorio (h3)"
                value={ctx.diplomadoPage.otrasSesionesIntro ?? ""}
                onChange={(v) =>
                  ctx.patchDiplomadoPage({ otrasSesionesIntro: v })
                }
                multiline
              />
            </>
          ) : (
            <>
              <EditField
                label="Título de la sección"
                value={ctx.filosofiaPage.sesionesTitle ?? ""}
                onChange={(v) => ctx.patchFilosofiaPage({ sesionesTitle: v })}
              />
              <EditField
                label="Texto introductorio de la sección"
                value={ctx.filosofiaPage.sesionesIntro ?? ""}
                onChange={(v) => ctx.patchFilosofiaPage({ sesionesIntro: v })}
                multiline
              />
            </>
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() =>
          ctx.addAgendaEntry(
            mode === "diplomado" ? "diplomado" : "conferencia",
          )
        }
        className="w-full rounded-lg border-2 border-dashed border-amber-400 py-2 text-sm font-semibold text-amber-800"
      >
        + Añadir {mode === "diplomado" ? "sesión" : "actividad"}
      </button>
      <ul className="space-y-2">
        {list.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => ctx.setSelectedAgendaId(e.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                ctx.selectedAgendaId === e.id
                  ? "border-amber-500 bg-amber-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="font-semibold">{e.title || "Sin título"}</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {e.date || e.startsAt} · {e.category}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-bold text-na-heketDark">Editar seleccionada</p>
          {mode === "otras" ? (
            <label className="block text-sm">
              <span className="font-semibold">Tipo</span>
              <select
                value={selected.category}
                onChange={(e) =>
                  ctx.patchAgendaEntry(selected.id, {
                    category: e.target.value as CmsAgendaEntry["category"],
                  })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="conferencia">Conferencia</option>
                <option value="curso">Curso</option>
                <option value="taller">Taller</option>
                <option value="cultura">Cultura</option>
                <option value="voluntariado">Voluntariado</option>
              </select>
            </label>
          ) : null}
          <EditField
            label="Título"
            value={selected.title}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { title: v })}
          />
          <EditField
            label="Etiqueta"
            value={selected.tag ?? ""}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { tag: v })}
          />
          <EditField
            label="Fecha legible"
            value={selected.date}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { date: v })}
          />
          <EditField
            label="Fecha ISO (YYYY-MM-DD)"
            value={selected.startsAt}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { startsAt: v })}
          />
          <EditField
            label="Hora"
            value={selected.time ?? ""}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { time: v })}
          />
          <EditField
            label="Sede"
            value={selected.sede ?? ""}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { sede: v })}
          />
          <EditField
            label="Descripción"
            value={selected.description ?? ""}
            onChange={(v) => ctx.patchAgendaEntry(selected.id, { description: v })}
            multiline
          />
          <AgendaEntryImageField
            image={selected.image ?? ""}
            imageAlt={selected.imageAlt ?? ""}
            token={ctx.token}
            onChange={(patch) => ctx.patchAgendaEntry(selected.id, patch)}
            label="Foto de la tarjeta"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.showOnHome !== false}
              onChange={(e) =>
                ctx.patchAgendaEntry(selected.id, { showOnHome: e.target.checked })
              }
            />
            Mostrar en carrusel del home
          </label>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Eliminar?")) ctx.deleteAgendaEntry(selected.id);
            }}
            className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
          >
            Eliminar
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Selecciona una entrada de la lista.</p>
      )}
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      )}
    </label>
  );
}

export function FilosofiaCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <FilosofiaCmsEditInner>{children}</FilosofiaCmsEditInner>;
}
