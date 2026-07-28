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
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import {
  fetchCmsDraft,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import {
  postToEditor,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import {
  buildDocWithSiteFooter,
  DEFAULT_SITE_FOOTER,
  SITE_FOOTER_PANEL_ID,
} from "@/lib/cms/site-footer-edit";
import type { CmsDocument, CmsSiteFooter } from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
} from "@/components/cms/CmsEditFields";

type SiteFooterCmsEditContextValue = {
  ready: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  footer: CmsSiteFooter;
  patchFooter: (patch: Partial<CmsSiteFooter>) => void;
  saveDraft: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
};

const SiteFooterCmsEditContext =
  createContext<SiteFooterCmsEditContextValue | null>(null);

export function useSiteFooterCmsEdit() {
  return useContext(SiteFooterCmsEditContext);
}

export { SITE_FOOTER_PANEL_ID };

function SiteFooterCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [footer, setFooter] = useState<CmsSiteFooter>(DEFAULT_SITE_FOOTER);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const ready = !!token;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const applyLoadedDoc = useCallback((draft: CmsDocument) => {
    setFooter({ ...DEFAULT_SITE_FOOTER, ...draft.sections.siteFooter });
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando pie de página…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDocWithSiteFooter(latest, footer);
      await saveCmsDraft("acropolis", token, next);
      setDirty(false);
      setStatus("Pie de página guardado.");
      postToEditor({
        type: "cms-status",
        text: "Pie de página guardado.",
        ok: true,
      });
      postToEditor({ type: "cms-dirty", dirty: false });
    } catch (e) {
      const text = String(e);
      setStatus(text);
      postToEditor({ type: "cms-status", text, ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, footer]);

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

  const patchFooter = useCallback(
    (patch: Partial<CmsSiteFooter>) => {
      setFooter((prev) => ({ ...prev, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): SiteFooterCmsEditContextValue => ({
      ready,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      footer,
      patchFooter,
      saveDraft,
      dirty,
      busy,
    }),
    [ready, panelOpen, footer, patchFooter, saveDraft, dirty, busy],
  );

  return (
    <SiteFooterCmsEditContext.Provider value={value}>
      {children}
      {panelOpen ? (
        <EditPanelChrome
          title="Editar pie de página"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setPanelOpen(false)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
              Estos textos y enlaces aparecen en el pie de página de{" "}
              <strong>todo</strong> el sitio principal. Los números de WhatsApp
              también alimentan los botones de contacto en otras páginas.
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Conectar (redes sociales)
            </p>
            <EditField
              label="Instagram — URL"
              value={footer.instagramUrl ?? ""}
              onChange={(v) => patchFooter({ instagramUrl: v })}
            />
            <EditField
              label="Instagram — usuario (accesibilidad)"
              value={footer.instagramHandle ?? ""}
              onChange={(v) => patchFooter({ instagramHandle: v })}
            />
            <EditField
              label="YouTube — URL"
              value={footer.youtubeUrl ?? ""}
              onChange={(v) => patchFooter({ youtubeUrl: v })}
            />
            <EditField
              label="Facebook — URL"
              value={footer.facebookUrl ?? ""}
              onChange={(v) => patchFooter({ facebookUrl: v })}
            />
            <p className="border-t border-slate-200 pt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              WhatsApp del sitio
            </p>
            <p className="text-xs text-slate-600">
              Solo dígitos con código de país, sin espacios ni signos (ej.{" "}
              <code className="rounded bg-slate-100 px-1">18495174144</code>).
            </p>
            <EditField
              label="Cursos, talleres y conferencias"
              value={footer.whatsappCursosNumber ?? ""}
              onChange={(v) => patchFooter({ whatsappCursosNumber: v })}
            />
            <EditField
              label="Diplomado, contacto general e icono del pie"
              value={footer.whatsappDiplomadoNumber ?? ""}
              onChange={(v) => patchFooter({ whatsappDiplomadoNumber: v })}
            />
            <p className="border-t border-slate-200 pt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Textos legales
            </p>
            <EditField
              label="Línea bajo redes sociales"
              value={footer.tagline ?? ""}
              onChange={(v) => patchFooter({ tagline: v })}
            />
            <EditField
              label="Domicilio legal"
              value={footer.legalDomicile ?? ""}
              onChange={(v) => patchFooter({ legalDomicile: v })}
            />
            <EditField
              label="Nota legal (barra inferior)"
              value={footer.legalNote ?? ""}
              onChange={(v) => patchFooter({ legalNote: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}
    </SiteFooterCmsEditContext.Provider>
  );
}

export function SiteFooterCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <SiteFooterCmsEditInner>{children}</SiteFooterCmsEditInner>;
}
