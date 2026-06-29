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
  buildDocWithPlatformNav,
  DEFAULT_PLATFORM_NAV,
  isPlatformNavVisible,
  PLATFORM_NAV_DEFAULT_URLS,
  PLATFORM_NAV_GITHUB_URLS,
  PLATFORM_NAV_LABELS,
  PLATFORM_NAV_ORDER,
  PLATFORM_NAV_PANEL_ID,
  resolvePlatformNavHref,
  setPlatformNavUrl,
  setPlatformNavVisible,
  applyPlatformNavGithubUrls,
} from "@/lib/cms/platform-nav-edit";
import type { CmsDocument, CmsPlatformNav } from "@/lib/cms/types";
import type { PlatformId } from "@/lib/site-config";
import { EditPanelChrome } from "@/components/cms/CmsEditFields";

type PlatformNavCmsEditContextValue = {
  ready: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  platformNav: CmsPlatformNav;
  setPlatformVisible: (id: PlatformId, visible: boolean) => void;
  setPlatformUrl: (id: PlatformId, url: string) => void;
  applyGithubUrls: () => void;
  saveDraft: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
};

const PlatformNavCmsEditContext =
  createContext<PlatformNavCmsEditContextValue | null>(null);

export function usePlatformNavCmsEdit() {
  return useContext(PlatformNavCmsEditContext);
}

export { PLATFORM_NAV_PANEL_ID };

function PlatformNavCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [platformNav, setPlatformNav] = useState<CmsPlatformNav>(
    DEFAULT_PLATFORM_NAV,
  );
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
    setPlatformNav({ ...DEFAULT_PLATFORM_NAV, ...draft.sections.platformNav });
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando bandeja de enlaces…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDocWithPlatformNav(latest, platformNav);
      await saveCmsDraft("acropolis", token, next);
      setDirty(false);
      setStatus("Bandeja de enlaces guardada.");
      postToEditor({
        type: "cms-status",
        text: "Bandeja de enlaces guardada.",
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
  }, [token, platformNav]);

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

  const setPlatformVisible = useCallback(
    (id: PlatformId, visible: boolean) => {
      setPlatformNav((prev) => setPlatformNavVisible(prev, id, visible));
      markDirty();
    },
    [markDirty],
  );

  const setPlatformUrl = useCallback(
    (id: PlatformId, url: string) => {
      setPlatformNav((prev) => setPlatformNavUrl(prev, id, url));
      markDirty();
    },
    [markDirty],
  );

  const applyGithubUrls = useCallback(() => {
    setPlatformNav((prev) => applyPlatformNavGithubUrls(prev));
    markDirty();
  }, [markDirty]);

  const value = useMemo(
    (): PlatformNavCmsEditContextValue => ({
      ready,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      platformNav,
      setPlatformVisible,
      setPlatformUrl,
      applyGithubUrls,
      saveDraft,
      dirty,
      busy,
    }),
    [
      ready,
      panelOpen,
      platformNav,
      setPlatformVisible,
      setPlatformUrl,
      applyGithubUrls,
      saveDraft,
      dirty,
      busy,
    ],
  );

  return (
    <PlatformNavCmsEditContext.Provider value={value}>
      {children}
      {panelOpen ? (
        <EditPanelChrome
          title="Enlaces de la bandeja superior"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setPanelOpen(false)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
              Activa o desactiva los accesos a Biblioteca, Librería Editorial
              Logos y Civis en la franja verde de arriba. Puedes cambiar la URL
              de cada enlace (por ejemplo a GitHub Pages ahora y al dominio
              oficial después). Los cambios aplican en <strong>todo</strong> el
              sitio principal.
            </p>
            <button
              type="button"
              onClick={applyGithubUrls}
              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-900 transition hover:bg-sky-50"
            >
              Rellenar URLs de GitHub Pages (Civis y Tienda)
            </button>
            <ul className="space-y-3">
              {PLATFORM_NAV_ORDER.map((id) => {
                const visible = isPlatformNavVisible(platformNav, id);
                const customUrl = platformNav.urls?.[id] ?? "";
                const effectiveHref = resolvePlatformNavHref(id, platformNav);
                return (
                  <li
                    key={id}
                    className="space-y-2 rounded-xl border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id={`platform-nav-${id}`}
                        type="checkbox"
                        checked={visible}
                        onChange={(e) =>
                          setPlatformVisible(id, e.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-na-heket focus:ring-na-kefer"
                      />
                      <label
                        htmlFor={`platform-nav-${id}`}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <span className="block text-sm font-semibold text-slate-900">
                          {PLATFORM_NAV_LABELS[id]}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {visible
                            ? "Visible en la bandeja verde"
                            : "Oculto — no aparece en la bandeja"}
                        </span>
                      </label>
                    </div>
                    <label className="block pl-7">
                      <span className="text-xs font-medium text-slate-700">
                        URL del enlace
                      </span>
                      <input
                        type="url"
                        value={customUrl}
                        placeholder={PLATFORM_NAV_DEFAULT_URLS[id]}
                        onChange={(e) => setPlatformUrl(id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                      <span className="mt-1 block text-[11px] text-slate-500">
                        {customUrl.trim()
                          ? `Destino: ${effectiveHref}`
                          : `Predeterminado del código: ${PLATFORM_NAV_DEFAULT_URLS[id]}`}
                      </span>
                      {PLATFORM_NAV_GITHUB_URLS[id] !==
                      PLATFORM_NAV_DEFAULT_URLS[id] ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPlatformUrl(id, PLATFORM_NAV_GITHUB_URLS[id])
                          }
                          className="mt-1 text-[11px] font-semibold text-sky-800 hover:underline"
                        >
                          Usar GitHub: {PLATFORM_NAV_GITHUB_URLS[id]}
                        </button>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </EditPanelChrome>
      ) : null}
    </PlatformNavCmsEditContext.Provider>
  );
}

export function PlatformNavCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <PlatformNavCmsEditInner>{children}</PlatformNavCmsEditInner>;
}
