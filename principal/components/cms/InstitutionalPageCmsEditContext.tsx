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
import {
  DEFAULT_QUIENES_SOMOS_PAGE,
  DEFAULT_RELACIONES_PAGE,
  mergeQuienesSomosPage,
  mergeRelacionesPage,
} from "@/lib/cms/institutional-page-edit";
import type {
  CmsDocument,
  CmsPersonaBlock,
  CmsQuienesSomosPage,
  CmsRelacionesPage,
} from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  HeroEditFields,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { mergeHeroCarouselsIntoDoc } from "@/lib/cms/hero-carousel-registry";

export type InstitutionalPageKey = "quienesSomos" | "relaciones";

type PageData = CmsQuienesSomosPage | CmsRelacionesPage;

type InstitutionalPageCmsEditContextValue = {
  ready: boolean;
  pageKey: InstitutionalPageKey;
  page: PageData;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchPage: (patch: Partial<PageData>) => void;
  patchPersona: (id: string, patch: Partial<CmsPersonaBlock>) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const InstitutionalPageCmsEditContext =
  createContext<InstitutionalPageCmsEditContextValue | null>(null);

export function useInstitutionalPageCmsEdit() {
  return useContext(InstitutionalPageCmsEditContext);
}

export function useQuienesSomosCmsEdit() {
  const ctx = useInstitutionalPageCmsEdit();
  return ctx?.pageKey === "quienesSomos" ? ctx : null;
}

export function useRelacionesCmsEdit() {
  const ctx = useInstitutionalPageCmsEdit();
  return ctx?.pageKey === "relaciones" ? ctx : null;
}

function defaultPage(key: InstitutionalPageKey): PageData {
  return key === "quienesSomos"
    ? DEFAULT_QUIENES_SOMOS_PAGE
    : DEFAULT_RELACIONES_PAGE;
}

function mergePage(key: InstitutionalPageKey, overrides?: PageData | null) {
  return key === "quienesSomos"
    ? mergeQuienesSomosPage(overrides as CmsQuienesSomosPage | null)
    : mergeRelacionesPage(overrides as CmsRelacionesPage | null);
}

function sectionKey(key: InstitutionalPageKey) {
  return key === "quienesSomos" ? "quienesSomosPage" : "relacionesPage";
}

function InstitutionalPageCmsEditInner({
  pageKey,
  children,
}: {
  pageKey: InstitutionalPageKey;
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<PageData>(defaultPage(pageKey));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const ready = !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const buildDoc = useCallback(
    (base: CmsDocument): CmsDocument => {
      const sk = sectionKey(pageKey);
      return mergeHeroCarouselsIntoDoc({
        ...base,
        sections: { ...base.sections, [sk]: page },
      });
    },
    [page, pageKey],
  );

  const applyLoadedDoc = useCallback(
    (draft: CmsDocument) => {
      const sk = sectionKey(pageKey);
      const loaded = draft.sections[sk as keyof typeof draft.sections] as
        | PageData
        | undefined;
      setPage(mergePage(pageKey, loaded));
      setDirty(false);
      postToEditor({ type: "cms-dirty", dirty: false });
    },
    [pageKey],
  );

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
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
    if (!token) return;
    if (!window.confirm("¿Publicar estos cambios?")) return;
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      await saveCmsDraft("acropolis", token, buildDoc(latest));
      const publishResult = await publishCms("acropolis", token);
      setDirty(false);
      setStatus(publishResult.message ?? "Publicado.");
} catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, buildDoc]);

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
    (patch: Partial<PageData>) => {
      setPage((p) => mergePage(pageKey, { ...p, ...patch }));
      markDirty();
    },
    [markDirty, pageKey],
  );

  const patchPersona = useCallback(
    (id: string, patch: Partial<CmsPersonaBlock>) => {
      if (pageKey !== "quienesSomos") return;
      const qs = page as CmsQuienesSomosPage;
      if (qs.directorNacional?.id === id) {
        patchPage({
          directorNacional: { ...qs.directorNacional, ...patch },
        } as Partial<PageData>);
        return;
      }
      const inAnteriores = qs.directoresAnteriores?.some((p) => p.id === id);
      if (inAnteriores) {
        patchPage({
          directoresAnteriores: (qs.directoresAnteriores ?? []).map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        } as Partial<PageData>);
        return;
      }
      patchPage({
        personas: (qs.personas ?? []).map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        ),
      } as Partial<PageData>);
    },
    [page, pageKey, patchPage],
  );

  const value = useMemo(
    (): InstitutionalPageCmsEditContextValue => ({
      ready,
      pageKey,
      page,
      selectedId,
      setSelectedId,
      patchPage,
      patchPersona,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      pageKey,
      page,
      selectedId,
      patchPage,
      patchPersona,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const qs = pageKey === "quienesSomos" ? (page as CmsQuienesSomosPage) : null;
  const rel = pageKey === "relaciones" ? (page as CmsRelacionesPage) : null;
  const personaId = selectedId?.startsWith("persona:")
    ? selectedId.slice("persona:".length)
    : null;
  const areaId = selectedId?.startsWith("area:")
    ? selectedId.slice("area:".length)
    : null;
  const selectedPersona =
    personaId && qs
      ? qs.personas?.find((p) => p.id === personaId) ??
        (qs.directorNacional?.id === personaId ? qs.directorNacional : null) ??
        qs.directoresAnteriores?.find((p) => p.id === personaId)
      : null;

  const toolbarLabel =
    pageKey === "quienesSomos" ? "Quiénes somos" : "Relaciones institucionales";

  return (
    <InstitutionalPageCmsEditContext.Provider value={value}>
      <EditToolbar
        label={toolbarLabel}
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
          <HeroEditFields value={page} onChange={patchPage} />
        </EditPanelChrome>
      ) : null}

      {selectedId === "__intro__" && qs ? (
        <EditPanelChrome
          title="Textos — Qué es NA"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-3">
            {(qs.introParagraphs ?? []).map((p, i) => (
              <EditField
                key={i}
                label={`Párrafo ${i + 1}`}
                value={p}
                onChange={(v) => {
                  const next = [...(qs.introParagraphs ?? [])];
                  next[i] = v;
                  patchPage({ introParagraphs: next } as Partial<PageData>);
                }}
                multiline
              />
            ))}
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__presidencia__" && qs ? (
        <EditPanelChrome
          title="Sección presidencia"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={qs.presidenciaEyebrow ?? ""}
              onChange={(v) =>
                patchPage({ presidenciaEyebrow: v } as Partial<PageData>)
              }
            />
            <EditField
              label="Título"
              value={qs.presidenciaTitle ?? ""}
              onChange={(v) =>
                patchPage({ presidenciaTitle: v } as Partial<PageData>)
              }
            />
            <EditField
              label="Introducción"
              value={qs.presidenciaIntro ?? ""}
              onChange={(v) =>
                patchPage({ presidenciaIntro: v } as Partial<PageData>)
              }
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedPersona && personaId ? (
        <EditPanelChrome
          title={`Editar — ${selectedPersona.name}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <PersonaEditFields
            persona={selectedPersona}
            token={token}
            onChange={(patch) => patchPersona(personaId, patch)}
          />
        </EditPanelChrome>
      ) : null}

      {selectedId === "__stats__" && rel ? (
        <EditPanelChrome
          title="Cifras destacadas"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            {(rel.stats ?? []).map((s, i) => (
              <div key={s.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Cifra {i + 1}
                </p>
                <EditField
                  label="Valor"
                  value={s.value}
                  onChange={(v) =>
                    patchPage({
                      stats: (rel.stats ?? []).map((st) =>
                        st.id === s.id ? { ...st, value: v } : st,
                      ),
                    } as Partial<PageData>)
                  }
                />
                <EditField
                  label="Descripción"
                  value={s.label}
                  onChange={(v) =>
                    patchPage({
                      stats: (rel.stats ?? []).map((st) =>
                        st.id === s.id ? { ...st, label: v } : st,
                      ),
                    } as Partial<PageData>)
                  }
                  multiline
                />
              </div>
            ))}
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__relIntro__" && rel ? (
        <EditPanelChrome
          title="Introducción"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <EditField
            label="Texto"
            value={rel.intro ?? ""}
            onChange={(v) => patchPage({ intro: v } as Partial<PageData>)}
            multiline
          />
        </EditPanelChrome>
      ) : null}

      {selectedId === "__areasSection__" && rel ? (
        <EditPanelChrome
          title="Áreas de colaboración — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={rel.areasEyebrow ?? ""}
              onChange={(v) =>
                patchPage({ areasEyebrow: v } as Partial<PageData>)
              }
            />
            <EditField
              label="Título"
              value={rel.areasTitle ?? ""}
              onChange={(v) =>
                patchPage({ areasTitle: v } as Partial<PageData>)
              }
            />
            <EditField
              label="Introducción"
              value={rel.areasIntro ?? ""}
              onChange={(v) =>
                patchPage({ areasIntro: v } as Partial<PageData>)
              }
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {areaId && rel ? (
        <EditPanelChrome
          title={`Área — ${rel.areas?.find((a) => a.id === areaId)?.title ?? areaId}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={rel.areas?.find((a) => a.id === areaId)?.title ?? ""}
              onChange={(v) =>
                patchPage({
                  areas: (rel.areas ?? []).map((a) =>
                    a.id === areaId ? { ...a, title: v } : a,
                  ),
                } as Partial<PageData>)
              }
            />
            <EditField
              label="Texto"
              value={rel.areas?.find((a) => a.id === areaId)?.text ?? ""}
              onChange={(v) =>
                patchPage({
                  areas: (rel.areas ?? []).map((a) =>
                    a.id === areaId ? { ...a, text: v } : a,
                  ),
                } as Partial<PageData>)
              }
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__rdSection__" && rel ? (
        <EditPanelChrome
          title="República Dominicana"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={rel.rdEyebrow ?? ""}
              onChange={(v) => patchPage({ rdEyebrow: v } as Partial<PageData>)}
            />
            <EditField
              label="Título"
              value={rel.rdTitle ?? ""}
              onChange={(v) => patchPage({ rdTitle: v } as Partial<PageData>)}
            />
            <EditField
              label="Introducción"
              value={rel.rdIntro ?? ""}
              onChange={(v) => patchPage({ rdIntro: v } as Partial<PageData>)}
              multiline
            />
            {(rel.rdItems ?? []).map((item, i) => (
              <EditField
                key={item.id}
                label={`Logro ${i + 1}`}
                value={item.text}
                onChange={(v) =>
                  patchPage({
                    rdItems: (rel.rdItems ?? []).map((r) =>
                      r.id === item.id ? { ...r, text: v } : r,
                    ),
                  } as Partial<PageData>)
                }
                multiline
              />
            ))}
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === "__cta__" && rel ? (
        <EditPanelChrome
          title="Llamado a la acción"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={rel.ctaTitle ?? ""}
              onChange={(v) => patchPage({ ctaTitle: v } as Partial<PageData>)}
            />
            <EditField
              label="Texto"
              value={rel.ctaText ?? ""}
              onChange={(v) => patchPage({ ctaText: v } as Partial<PageData>)}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}
    </InstitutionalPageCmsEditContext.Provider>
  );
}

function PersonaEditFields({
  persona,
  token,
  onChange,
}: {
  persona: CmsPersonaBlock;
  token: string | null;
  onChange: (patch: Partial<CmsPersonaBlock>) => void;
}) {
  return (
    <div className="space-y-4">
      <EditField
        label="Nombre"
        value={persona.name}
        onChange={(v) => onChange({ name: v })}
      />
      <EditField
        label="Cargo"
        value={persona.role}
        onChange={(v) => onChange({ role: v })}
      />
      <EditField
        label="Período"
        value={persona.period ?? ""}
        onChange={(v) => onChange({ period: v })}
      />
      <EditField
        label="Biografía"
        value={persona.bio}
        onChange={(v) => onChange({ bio: v })}
        multiline
      />
      <AgendaEntryImageField
        label="Foto"
        site="acropolis"
        image={persona.photo ?? ""}
        imageAlt={persona.name}
        token={token}
        onChange={(patch) => {
          if (patch.image !== undefined) onChange({ photo: patch.image });
        }}
      />
    </div>
  );
}

export function InstitutionalPageCmsEditProvider({
  pageKey,
  children,
}: {
  pageKey: InstitutionalPageKey;
  children: ReactNode;
}) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return (
    <InstitutionalPageCmsEditInner pageKey={pageKey}>
      {children}
    </InstitutionalPageCmsEditInner>
  );
}
