"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  EditField,
  EditPanelChrome,
  EditToolbar,
  ImageField,
  SectionCopyFields,
  UrlImageField,
} from "@/components/cms/CmsEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import {
  fetchCmsDraft,
  publishCms,
  saveCmsDraft,
} from "@/lib/cms/api-client";
import {
  buildEditorialDoc,
  loadEditableDoc,
  newHeroImageId,
  type EditorialEditableState,
} from "@/lib/cms/editorial-display";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type {
  CmsDocument,
  CmsEditorialDigitalBook,
  CmsEditorialHeroImage,
  CmsEditorialHomeCard,
  CmsEditorialRegalo,
  CmsEditorialRevista,
} from "@/lib/cms/types";
import { useCmsHydrated } from "@/lib/cms/hydration";

type EditorialCmsEditContextValue = {
  ready: boolean;
  token: string | null;
  state: EditorialEditableState;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchWelcome: (patch: Partial<EditorialEditableState["welcome"]>) => void;
  patchFooter: (patch: Partial<EditorialEditableState["footer"]>) => void;
  patchHomeCard: (id: string, patch: Partial<CmsEditorialHomeCard>) => void;
  patchHeroImage: (id: string, patch: Partial<CmsEditorialHeroImage>) => void;
  addHeroImage: () => void;
  removeHeroImage: (id: string) => void;
  patchRevista: (title: string, patch: Partial<CmsEditorialRevista>) => void;
  patchRegalo: (id: string, patch: Partial<CmsEditorialRegalo>) => void;
  patchRegaloCategory: (
    id: string,
    patch: Partial<EditorialEditableState["regaloCategories"][number]>,
  ) => void;
  patchDigitalGroup: (
    id: string,
    patch: Partial<EditorialEditableState["digitalBooks"][number]>,
  ) => void;
  patchDigitalBook: (
    groupId: string,
    title: string,
    patch: Partial<CmsEditorialDigitalBook>,
  ) => void;
  patchQuienesLibreria: (
    patch: Partial<NonNullable<EditorialEditableState["quienesSomos"]["libreria"]>>,
  ) => void;
  patchQuienesNa: (
    patch: Partial<NonNullable<EditorialEditableState["quienesSomos"]["nuevaAcropolis"]>>,
  ) => void;
  patchDondeVisit: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["visit"]>>,
  ) => void;
  patchDondePage: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["page"]>>,
  ) => void;
  patchDondePhoto: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["storePhoto"]>>,
  ) => void;
  patchDondeSede: (
    id: string,
    patch: Partial<NonNullable<EditorialEditableState["donde"]["sedes"]>[number]>,
  ) => void;
  patchBookFilters: (
    patch: Partial<EditorialEditableState["bookFilters"]>,
  ) => void;
  patchShopCategories: (
    patch: EditorialEditableState["shopCategories"],
  ) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
};

const EditorialCmsEditContext =
  createContext<EditorialCmsEditContextValue | null>(null);

export function useEditorialCmsEdit() {
  return useContext(EditorialCmsEditContext);
}

function EditorialEditPanel({
  edit,
  selectedId,
  dirty,
  busy,
  status,
  onClose,
  onSave,
}: {
  edit: EditorialCmsEditContextValue;
  selectedId: string;
  dirty: boolean;
  busy: boolean;
  status: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const { state, token } = edit;
  const chrome = (title: string, children: ReactNode) => (
    <EditPanelChrome
      title={title}
      dirty={dirty}
      busy={busy}
      status={status}
      onClose={onClose}
      onSave={onSave}
    >
      {children}
    </EditPanelChrome>
  );

  if (selectedId === "welcome") {
    return chrome(
      "Texto de bienvenida",
      <div className="space-y-4">
        <EditField
          label="Título principal"
          value={state.welcome.title ?? ""}
          onChange={(v) => edit.patchWelcome({ title: v })}
        />
        <EditField
          label="Párrafo introductorio"
          value={state.welcome.lede ?? ""}
          onChange={(v) => edit.patchWelcome({ lede: v })}
          multiline
        />
        <EditField
          label="Etiquetas (separadas por ·)"
          value={state.welcome.tagline ?? ""}
          onChange={(v) => edit.patchWelcome({ tagline: v })}
        />
      </div>,
    );
  }

  if (selectedId === "heroImages") {
    return chrome(
      "Fotos del carrusel",
      <div className="space-y-3">
        {state.heroImages.map((img) => (
          <button
            key={img.id}
            type="button"
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => edit.setSelectedId(`heroImage:${img.id}`)}
          >
            {img.alt || img.src || img.id}
          </button>
        ))}
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
          onClick={() => edit.addHeroImage()}
        >
          + Añadir foto
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("heroImage:")) {
    const id = selectedId.slice("heroImage:".length);
    const img = state.heroImages.find((h) => h.id === id);
    if (!img) return null;
    return chrome(
      "Foto del carrusel",
      <div className="space-y-4">
        <ImageField
          label="Imagen"
          token={token}
          media={{ src: img.src ?? "", alt: img.alt ?? "", objectPosition: img.objectPosition }}
          onChange={(m) =>
            edit.patchHeroImage(id, {
              src: m.src,
              alt: m.alt,
              objectPosition: m.objectPosition,
            })
          }
        />
        <button
          type="button"
          className="text-xs text-red-600"
          onClick={() => {
            if (window.confirm("¿Quitar esta foto?")) {
              edit.removeHeroImage(id);
              edit.setSelectedId("heroImages");
            }
          }}
        >
          Eliminar foto
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("homeCard:")) {
    const id = selectedId.slice("homeCard:".length);
    const card = state.homeCards.find((c) => c.id === id);
    if (!card) return null;
    return chrome(
      "Tarjeta del inicio",
      <div className="space-y-4">
        <EditField label="Título" value={card.title ?? ""} onChange={(v) => edit.patchHomeCard(id, { title: v })} />
        <EditField
          label="Descripción"
          value={card.description ?? ""}
          onChange={(v) => edit.patchHomeCard(id, { description: v })}
          multiline
        />
        <EditField
          label="Ancla de sección (hash)"
          value={card.hash ?? ""}
          onChange={(v) => edit.patchHomeCard(id, { hash: v })}
        />
      </div>,
    );
  }

  if (selectedId === "footer") {
    return chrome(
      "Pie de página",
      <EditField
        label="Línea bajo el logo"
        value={state.footer.tagline ?? ""}
        onChange={(v) => edit.patchFooter({ tagline: v })}
        multiline
      />,
    );
  }

  if (selectedId.startsWith("revista:")) {
    const title = selectedId.slice("revista:".length);
    const item = state.revistas.find((r) => r.title === title);
    if (!item) return null;
    return chrome(
      "Revista",
      <div className="space-y-4">
        <EditField label="Título" value={item.title} onChange={(v) => edit.patchRevista(title, { title: v })} />
        <EditField label="Descripción" value={item.description ?? ""} onChange={(v) => edit.patchRevista(title, { description: v })} multiline />
        <EditField label="Enlace (href)" value={item.href ?? ""} onChange={(v) => edit.patchRevista(title, { href: v })} />
        <EditField label="Etiqueta del botón" value={item.linkLabel ?? ""} onChange={(v) => edit.patchRevista(title, { linkLabel: v })} />
        <UrlImageField label="Portada" url={item.imageUrl ?? ""} alt={item.imageAlt} token={token} onUrlChange={(v) => edit.patchRevista(title, { imageUrl: v })} onAltChange={(v) => edit.patchRevista(title, { imageAlt: v })} />
      </div>,
    );
  }

  if (selectedId.startsWith("regalo:")) {
    const id = selectedId.slice("regalo:".length);
    const item = state.regalos.find((r) => r.id === id);
    if (!item) return null;
    return chrome(
      "Regalo",
      <div className="space-y-4">
        <EditField label="Título" value={item.title ?? ""} onChange={(v) => edit.patchRegalo(id, { title: v })} />
        <EditField label="Descripción" value={item.description ?? ""} onChange={(v) => edit.patchRegalo(id, { description: v })} multiline />
        <EditField label="Cita" value={item.quote ?? ""} onChange={(v) => edit.patchRegalo(id, { quote: v })} multiline />
        <EditField label="Autor de la cita" value={item.author ?? ""} onChange={(v) => edit.patchRegalo(id, { author: v })} />
        <UrlImageField label="Foto principal" url={item.imageUrl ?? ""} token={token} onUrlChange={(v) => edit.patchRegalo(id, { imageUrl: v })} />
        <UrlImageField label="Foto reverso" url={item.backImageUrl ?? ""} token={token} onUrlChange={(v) => edit.patchRegalo(id, { backImageUrl: v })} />
        <EditField label="Precio (número)" value={item.price != null ? String(item.price) : ""} onChange={(v) => edit.patchRegalo(id, { price: v ? Number(v) : null })} />
        <EditField label="Nota de precio" value={item.priceNote ?? ""} onChange={(v) => edit.patchRegalo(id, { priceNote: v })} />
      </div>,
    );
  }

  if (selectedId.startsWith("digitalGroup:")) {
    const id = selectedId.slice("digitalGroup:".length);
    const group = state.digitalBooks.find((g) => g.id === id);
    if (!group) return null;
    return chrome(
      "Grupo de libros digitales",
      <div className="space-y-4">
        <EditField label="Nombre del grupo" value={group.label ?? ""} onChange={(v) => edit.patchDigitalGroup(id, { label: v })} />
        <EditField label="Descripción" value={group.description ?? ""} onChange={(v) => edit.patchDigitalGroup(id, { description: v })} multiline />
      </div>,
    );
  }

  if (selectedId.startsWith("digitalBook:")) {
    const rest = selectedId.slice("digitalBook:".length);
    const sep = rest.indexOf(":");
    const groupId = rest.slice(0, sep);
    const bookTitle = rest.slice(sep + 1);
    const group = state.digitalBooks.find((g) => g.id === groupId);
    const book = group?.books?.find((b) => b.title === bookTitle);
    if (!book) return null;
    return chrome(
      "Libro digital",
      <div className="space-y-4">
        <EditField label="Título" value={book.title} onChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { title: v })} />
        <EditField label="Autor" value={book.author ?? ""} onChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { author: v })} />
        <EditField label="URL de descarga" value={book.downloadUrl ?? ""} onChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { downloadUrl: v })} />
        <UrlImageField label="Portada" url={book.coverUrl ?? ""} token={token} onUrlChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { coverUrl: v })} />
      </div>,
    );
  }

  if (selectedId === "quienes:libreria") {
    const lib = state.quienesSomos.libreria ?? {};
    return chrome(
      "Editorial Logos — textos",
      <div className="space-y-4">
        <EditField label="Etiqueta" value={lib.eyebrow ?? ""} onChange={(v) => edit.patchQuienesLibreria({ eyebrow: v })} />
        <EditField label="Título" value={lib.title ?? ""} onChange={(v) => edit.patchQuienesLibreria({ title: v })} />
        {(lib.paragraphs ?? []).map((p, i) => (
          <EditField key={i} label={`Párrafo ${i + 1}`} value={p} onChange={(v) => {
            const paragraphs = [...(lib.paragraphs ?? [])];
            paragraphs[i] = v;
            edit.patchQuienesLibreria({ paragraphs });
          }} multiline />
        ))}
      </div>,
    );
  }

  if (selectedId === "quienes:na") {
    const na = state.quienesSomos.nuevaAcropolis ?? {};
    return chrome(
      "Qué es Nueva Acrópolis",
      <div className="space-y-4">
        <EditField label="Título" value={na.title ?? ""} onChange={(v) => edit.patchQuienesNa({ title: v })} />
        <ImageField label="Imagen" token={token} media={{ src: na.heroImage?.src ?? "", alt: na.heroImage?.alt ?? "" }} onChange={(m) => edit.patchQuienesNa({ heroImage: { src: m.src, alt: m.alt } })} />
        <EditField label="Etiqueta del botón" value={na.ctaLabel ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaLabel: v })} />
        <EditField label="URL del botón" value={na.ctaHref ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaHref: v })} />
      </div>,
    );
  }

  if (selectedId === "donde:visit") {
    return chrome("Visítanos", <SectionCopyFields value={state.donde.visit ?? {}} onChange={(p) => edit.patchDondeVisit(p)} />);
  }

  if (selectedId === "donde:page") {
    return chrome("Página — encabezado", <SectionCopyFields value={state.donde.page ?? {}} onChange={(p) => edit.patchDondePage(p)} />);
  }

  if (selectedId === "donde:photo") {
    const photo = state.donde.storePhoto ?? {};
    return chrome(
      "Foto de la librería",
      <div className="space-y-4">
        <UrlImageField label="Imagen principal" url={photo.src ?? ""} alt={photo.alt} token={token} onUrlChange={(v) => edit.patchDondePhoto({ src: v })} onAltChange={(v) => edit.patchDondePhoto({ alt: v })} />
      </div>,
    );
  }

  if (selectedId.startsWith("donde:sede:")) {
    const id = selectedId.slice("donde:sede:".length);
    const sede = state.donde.sedes?.find((s) => s.id === id);
    if (!sede) return null;
    return chrome(
      "Sede",
      <div className="space-y-4">
        <EditField label="Nombre" value={sede.name ?? ""} onChange={(v) => edit.patchDondeSede(id, { name: v })} />
        <EditField label="Dirección" value={sede.address ?? ""} onChange={(v) => edit.patchDondeSede(id, { address: v })} multiline />
        <EditField label="Horario" value={sede.hours ?? ""} onChange={(v) => edit.patchDondeSede(id, { hours: v })} />
        <EditField label="Nota" value={sede.note ?? ""} onChange={(v) => edit.patchDondeSede(id, { note: v })} multiline />
      </div>,
    );
  }

  if (selectedId === "libros:filters") {
    return chrome(
      "Filtros del catálogo",
      <p className="text-sm text-slate-600">
        Los temas y autores del catálogo impreso se editan desde el panel. Contacta al administrador para ampliar esta sección si necesitas más control.
      </p>,
    );
  }

  return null;
}

function EditorialCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [baseDoc, setBaseDoc] = useState<CmsDocument | null>(null);
  const [state, setState] = useState<EditorialEditableState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const hydrated = useCmsHydrated();
  const ready = hydrated && !!token && !!state;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const updateState = useCallback(
    (fn: (s: EditorialEditableState) => EditorialEditableState) => {
      setState((prev) => (prev ? fn(prev) : prev));
      markDirty();
    },
    [markDirty],
  );

  const applyLoaded = useCallback((draft: CmsDocument) => {
    setBaseDoc(draft);
    setState(loadEditableDoc(draft));
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token || !baseDoc || !state) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("editorial");
      const next = buildEditorialDoc(latest, state);
      await saveCmsDraft("editorial", token, next);
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
    if (!window.confirm("¿Publicar estos cambios en la tienda?")) return;
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("editorial");
      const next = buildEditorialDoc(latest, state);
      await saveCmsDraft("editorial", token, next);
      await publishCms("editorial", token);
      setDirty(false);
      setStatus("Publicado.");
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
      fetchCmsDraft("editorial")
        .then((draft) => {
          applyLoaded(draft);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "editorial");
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

  const value: EditorialCmsEditContextValue | null = state
    ? {
        ready,
        token,
        state,
        selectedId,
        setSelectedId,
        patchWelcome: (patch) =>
          updateState((s) => ({ ...s, welcome: { ...s.welcome, ...patch } })),
        patchFooter: (patch) =>
          updateState((s) => ({ ...s, footer: { ...s.footer, ...patch } })),
        patchHomeCard: (id, patch) =>
          updateState((s) => ({
            ...s,
            homeCards: s.homeCards.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          })),
        patchHeroImage: (id, patch) =>
          updateState((s) => ({
            ...s,
            heroImages: s.heroImages.map((h) =>
              h.id === id ? { ...h, ...patch } : h,
            ),
          })),
        addHeroImage: () => {
          const img: CmsEditorialHeroImage = {
            id: newHeroImageId(),
            src: "",
            alt: "Nueva foto",
          };
          updateState((s) => ({ ...s, heroImages: [...s.heroImages, img] }));
          setSelectedId(`heroImage:${img.id}`);
        },
        removeHeroImage: (id) =>
          updateState((s) => ({
            ...s,
            heroImages: s.heroImages.filter((h) => h.id !== id),
          })),
        patchRevista: (title, patch) =>
          updateState((s) => ({
            ...s,
            revistas: s.revistas.map((r) =>
              r.title === title ? { ...r, ...patch } : r,
            ),
          })),
        patchRegalo: (id, patch) =>
          updateState((s) => ({
            ...s,
            regalos: s.regalos.map((r) =>
              r.id === id ? { ...r, ...patch } : r,
            ),
          })),
        patchRegaloCategory: (id, patch) =>
          updateState((s) => ({
            ...s,
            regaloCategories: s.regaloCategories.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          })),
        patchDigitalGroup: (id, patch) =>
          updateState((s) => ({
            ...s,
            digitalBooks: s.digitalBooks.map((g) =>
              g.id === id ? { ...g, ...patch } : g,
            ),
          })),
        patchDigitalBook: (groupId, bookTitle, patch) =>
          updateState((s) => ({
            ...s,
            digitalBooks: s.digitalBooks.map((g) =>
              g.id !== groupId
                ? g
                : {
                    ...g,
                    books: (g.books ?? []).map((b) =>
                      b.title === bookTitle ? { ...b, ...patch } : b,
                    ),
                  },
            ),
          })),
        patchQuienesLibreria: (patch) =>
          updateState((s) => ({
            ...s,
            quienesSomos: {
              ...s.quienesSomos,
              libreria: { ...s.quienesSomos.libreria, ...patch },
            },
          })),
        patchQuienesNa: (patch) =>
          updateState((s) => ({
            ...s,
            quienesSomos: {
              ...s.quienesSomos,
              nuevaAcropolis: {
                ...s.quienesSomos.nuevaAcropolis,
                ...patch,
                heroImage: patch.heroImage
                  ? { ...s.quienesSomos.nuevaAcropolis?.heroImage, ...patch.heroImage }
                  : s.quienesSomos.nuevaAcropolis?.heroImage,
              },
            },
          })),
        patchDondeVisit: (patch) =>
          updateState((s) => ({
            ...s,
            donde: { ...s.donde, visit: { ...s.donde.visit, ...patch } },
          })),
        patchDondePage: (patch) =>
          updateState((s) => ({
            ...s,
            donde: { ...s.donde, page: { ...s.donde.page, ...patch } },
          })),
        patchDondePhoto: (patch) =>
          updateState((s) => ({
            ...s,
            donde: {
              ...s.donde,
              storePhoto: { ...s.donde.storePhoto, ...patch },
            },
          })),
        patchDondeSede: (id, patch) =>
          updateState((s) => ({
            ...s,
            donde: {
              ...s.donde,
              sedes: (s.donde.sedes ?? []).map((sed) =>
                sed.id === id ? { ...sed, ...patch } : sed,
              ),
            },
          })),
        patchBookFilters: (patch) =>
          updateState((s) => ({
            ...s,
            bookFilters: { ...s.bookFilters, ...patch },
          })),
        patchShopCategories: (categories) =>
          updateState((s) => ({ ...s, shopCategories: categories })),
        saveDraft,
        publish,
        dirty,
        busy,
      }
    : null;

  return (
    <EditorialCmsEditContext.Provider value={value}>
      {ready ? (
        <EditToolbar
          label="Librería Editorial Logos"
          dirty={dirty}
          busy={busy}
          status={status}
          onSave={() => void saveDraft()}
          onPublish={() => void publish()}
        />
      ) : null}
      {children}
      {value && selectedId ? (
        <EditorialEditPanel
          edit={value}
          selectedId={selectedId}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        />
      ) : null}
    </EditorialCmsEditContext.Provider>
  );
}

export function EditorialCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <EditorialCmsEditInner>{children}</EditorialCmsEditInner>;
}

export { editorialStateAsDoc } from "@/lib/cms/editorial-display";
