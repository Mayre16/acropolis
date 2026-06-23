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
import { usePathname } from "next/navigation";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { matchesAppPath } from "@/lib/cms/edit-mode";

const VENUES_STANDALONE_PATHS = ["/donde-estamos", "/esfera"] as const;
import { VENUE_LOCATIONS } from "@/lib/locations";
import {
  buildDocWithVenues,
  getVenuesForEdit,
  newVenueId,
} from "@/lib/cms/venues-edit";
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
import type { CmsDocument, CmsVenue } from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
} from "@/components/cms/CmsEditFields";
import { VenueEditFields } from "@/components/cms/VenueEditFields";

type VenuesCmsEditContextValue = {
  ready: boolean;
  items: CmsVenue[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchItem: (id: string, patch: Partial<CmsVenue>) => void;
  addItem: (kind: CmsVenue["kind"]) => void;
  hideItem: (id: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

const VenuesCmsEditContext = createContext<VenuesCmsEditContextValue | null>(
  null,
);

export function useVenuesCmsEdit() {
  return useContext(VenuesCmsEditContext);
}

function VenuesCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [items, setItems] = useState<CmsVenue[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
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
    const { items: loaded, hidden: h } = getVenuesForEdit(
      draft,
      VENUE_LOCATIONS,
    );
    setItems(loaded);
    setHidden(h);
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDocWithVenues(latest, items, hidden);
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
  }, [token, items, hidden]);

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
      const next = buildDocWithVenues(latest, items, hidden);
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
  }, [token, items, hidden]);

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

  const patchItem = useCallback(
    (id: string, patch: Partial<CmsVenue>) => {
      setItems((list) =>
        list.map((v) => (v.id === id ? { ...v, ...patch } : v)),
      );
      markDirty();
    },
    [markDirty],
  );

  const addItem = useCallback(
    (kind: CmsVenue["kind"]) => {
      const id = newVenueId();
      const entry: CmsVenue = {
        id,
        name: kind === "sede" ? "Nueva ubicación" : "Nuevo punto",
        kind,
        city: "",
        zone: "",
        address: "",
        mapsQuery: "",
        note: "",
      };
      setItems((list) => [...list, entry]);
      setSelectedId(id);
      markDirty();
    },
    [markDirty],
  );

  const hideItem = useCallback(
    (id: string) => {
      setItems((list) => list.filter((v) => v.id !== id));
      setHidden((h) => (h.includes(id) ? h : [...h, id]));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): VenuesCmsEditContextValue => ({
      ready,
      items,
      selectedId,
      setSelectedId,
      patchItem,
      addItem,
      hideItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      items,
      selectedId,
      patchItem,
      addItem,
      hideItem,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selected = items.find((v) => v.id === selectedId);

  return (
    <VenuesCmsEditContext.Provider value={value}>
      <EditToolbar
        label="Sedes y puntos culturales"
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
          title="Editar sede o punto cultural"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <VenueEditFields
            venue={selected}
            onChange={(patch) => patchItem(selected.id, patch)}
            onHide={() => {
              if (window.confirm("¿Ocultar este espacio del sitio?")) {
                hideItem(selected.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
    </VenuesCmsEditContext.Provider>
  );
}

export function VenuesCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  const pathname = usePathname();
  if (editMode !== "1") return <>{children}</>;
  if (!VENUES_STANDALONE_PATHS.some((p) => matchesAppPath(pathname, p))) {
    return <>{children}</>;
  }
  return <VenuesCmsEditInner>{children}</VenuesCmsEditInner>;
}
