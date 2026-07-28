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
import { useCmsEditBridge } from "@/hooks/useCmsEditBridge";
import { matchesAppPath } from "@/lib/cms/edit-mode";

const VENUES_STANDALONE_PATHS = ["/donde-estamos", "/esfera"] as const;
import { VENUE_LOCATIONS } from "@/lib/locations";
import {
  buildDocWithVenues,
  DEFAULT_VENUES_CONTACT,
  getVenuesForEdit,
  mergeVenuesContact,
  newVenueId,
  VENUES_CONTACT_PANEL_ID,
} from "@/lib/cms/venues-edit";
import {
  fetchCmsDraft,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type { CmsDocument, CmsVenue, CmsVenuesContact } from "@/lib/cms/types";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
} from "@/components/cms/CmsEditFields";
import { VenueEditFields } from "@/components/cms/VenueEditFields";

type VenuesCmsEditContextValue = {
  ready: boolean;
  items: CmsVenue[];
  contact: CmsVenuesContact;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  openContactPanel: () => void;
  patchItem: (id: string, patch: Partial<CmsVenue>) => void;
  patchContact: (patch: Partial<CmsVenuesContact>) => void;
  addItem: (kind: CmsVenue["kind"]) => void;
  hideItem: (id: string) => void;
  restoreItem: (id: string) => void;
  hidden: string[];
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  token: string | null;
};

export { VENUES_CONTACT_PANEL_ID };

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
  const [contact, setContact] = useState<CmsVenuesContact>(DEFAULT_VENUES_CONTACT);
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
    setContact(mergeVenuesContact(draft));
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("acropolis");
      const next = buildDocWithVenues(latest, items, hidden, contact);
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
  }, [token, items, hidden, contact]);

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

  const patchContact = useCallback(
    (patch: Partial<CmsVenuesContact>) => {
      setContact((prev) => ({ ...prev, ...patch }));
      markDirty();
    },
    [markDirty],
  );

  const openContactPanel = useCallback(() => {
    setSelectedId(VENUES_CONTACT_PANEL_ID);
  }, []);

  const hideItem = useCallback(
    (id: string) => {
      setItems((list) => list.filter((v) => v.id !== id));
      setHidden((h) => (h.includes(id) ? h : [...h, id]));
      setSelectedId(null);
      markDirty();
    },
    [markDirty],
  );

  const restoreItem = useCallback(
    (id: string) => {
      setHidden((h) => h.filter((x) => x !== id));
      setItems((list) => {
        if (list.some((v) => v.id === id)) return list;
        const seed = VENUE_LOCATIONS.find((v) => v.id === id);
        if (!seed) return list;
        return [
          ...list,
          {
            id: seed.id,
            name: seed.name,
            kind: seed.kind,
            city: seed.city,
            zone: seed.zone,
            address: seed.address,
            reference: seed.reference,
            phone: seed.phone,
            email: seed.email,
            mapsQuery: seed.mapsQuery,
            note: seed.note,
            mapX: seed.mapX,
            mapY: seed.mapY,
            mapHideLabel: seed.mapHideLabel,
          },
        ];
      });
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo(
    (): VenuesCmsEditContextValue => ({
      ready,
      items,
      contact,
      selectedId,
      setSelectedId,
      openContactPanel,
      patchItem,
      patchContact,
      addItem,
      hideItem,
      restoreItem,
      hidden,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    }),
    [
      ready,
      items,
      contact,
      selectedId,
      openContactPanel,
      patchItem,
      patchContact,
      addItem,
      hideItem,
      restoreItem,
      hidden,
      saveDraft,
      publish,
      dirty,
      busy,
      token,
    ],
  );

  const selectedVenue =
    selectedId && selectedId !== VENUES_CONTACT_PANEL_ID
      ? items.find((v) => v.id === selectedId)
      : undefined;
  const contactPanelOpen = selectedId === VENUES_CONTACT_PANEL_ID;

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
      {selectedVenue ? (
        <EditPanelChrome
          title="Editar sede o punto cultural"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <VenueEditFields
            venue={selectedVenue}
            cityHasSede={items.some(
              (v) =>
                v.id !== selectedVenue.id &&
                v.kind === "sede" &&
                v.city.trim() === selectedVenue.city.trim() &&
                v.city.trim().length > 0,
            )}
            onChange={(patch) => patchItem(selectedVenue.id, patch)}
            onHide={() => {
              if (window.confirm("¿Ocultar este espacio del sitio?")) {
                hideItem(selectedVenue.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
      {ready && hidden.length > 0 ? (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950">
            Sedes / puntos ocultos
          </p>
          <ul className="mt-2 space-y-2">
            {hidden.map((id) => {
              const venue = VENUE_LOCATIONS.find((v) => v.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-2 text-sm text-amber-950"
                >
                  <span>{venue?.name ?? id}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-emerald-400 bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800"
                    onClick={() => restoreItem(id)}
                  >
                    Mostrar de nuevo
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {contactPanelOpen ? (
        <EditPanelChrome
          title="Bloque — ¿Necesitas más información?"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={contact.title ?? ""}
              onChange={(v) => patchContact({ title: v })}
            />
            <EditField
              label="Texto"
              value={contact.body ?? ""}
              onChange={(v) => patchContact({ body: v })}
              multiline
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <EditField
                label="Teléfono"
                value={contact.phone ?? ""}
                onChange={(v) => patchContact({ phone: v })}
              />
              <EditField
                label="Correo"
                value={contact.email ?? ""}
                onChange={(v) => patchContact({ email: v })}
              />
            </div>
            <EditField
              label="Número WhatsApp del botón"
              value={contact.whatsappNumber ?? ""}
              onChange={(v) => patchContact({ whatsappNumber: v })}
            />
            <p className="-mt-2 text-xs text-slate-500">
              Si lo deja vacío, el botón usará el teléfono mostrado arriba. Solo
              dígitos o formato internacional (ej. 18299617843).
            </p>
            <EditField
              label="Mensaje prellenado de WhatsApp (opcional)"
              value={contact.whatsappMessage ?? ""}
              onChange={(v) => patchContact({ whatsappMessage: v })}
              multiline
            />
            <EditField
              label="Texto del botón WhatsApp"
              value={contact.ctaLabel ?? ""}
              onChange={(v) => patchContact({ ctaLabel: v })}
            />
          </div>
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
