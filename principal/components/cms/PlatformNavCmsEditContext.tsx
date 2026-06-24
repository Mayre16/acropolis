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
  buildDocWithPlatformNav,
  DEFAULT_PLATFORM_NAV,
  isPlatformNavVisible,
  PLATFORM_NAV_LABELS,
  PLATFORM_NAV_ORDER,
  PLATFORM_NAV_PANEL_ID,
  setPlatformNavVisible,
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
      const next = buildDocWithPlatformNav(latest, platformNav);
      await saveCmsDraft("acropolis", token, next);
      await publishCms("acropolis", token);
      setDirty(false);
      setStatus("Publicado.");
    } catch (e) {
      const text = String(e);
      setStatus(text);
      postToEditor({ type: "cms-status", text, ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, platformNav]);

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

  const setPlatformVisible = useCallback(
    (id: PlatformId, visible: boolean) => {
      setPlatformNav((prev) => setPlatformNavVisible(prev, id, visible));
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): PlatformNavCmsEditContextValue => ({
      ready,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      platformNav,
      setPlatformVisible,
      saveDraft,
      dirty,
      busy,
    }),
    [ready, panelOpen, platformNav, setPlatformVisible, saveDraft, dirty, busy],
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
              Logos y Civis en la franja verde de arriba. Los cambios aplican en{" "}
              <strong>todo</strong> el sitio principal.
            </p>
            <ul className="space-y-3">
              {PLATFORM_NAV_ORDER.map((id) => {
                const visible = isPlatformNavVisible(platformNav, id);
                return (
                  <li
                    key={id}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                  >
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
