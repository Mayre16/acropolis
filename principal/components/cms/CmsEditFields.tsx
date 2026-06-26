"use client";

import { useCmsEditorEmbedded } from "@/hooks/useCmsEditorEmbedded";

import { useState, type ReactNode } from "react";
import { Images } from "lucide-react";
import {
  cmsUploadPathExample,
  resolveCmsMediaUrl,
  uploadCmsImage,
} from "@/lib/cms/api-client";
import { useHeroCarouselCmsEdit } from "@/components/cms/HeroCarouselCmsEditContext";
import {
  type CmsHeroCarouselKey,
} from "@/lib/cms/hero-carousel-edit";
import type { CmsMedia } from "@/lib/cms/types";
import {
  applySpellReplacement,
  shouldSpellcheckField,
  useSpellcheck,
} from "@/lib/spellcheck";
import {
  SpellcheckBadge,
  SpellcheckHints,
} from "@/components/cms/SpellcheckHints";

const fieldClass =
  "mt-1 w-full rounded-lg border px-3 py-2 spellcheck-field";

export function EditField({
  label,
  value,
  onChange,
  multiline,
  spellcheckEnabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  spellcheckEnabled?: boolean;
}) {
  const enabled =
    spellcheckEnabled ?? shouldSpellcheckField(label, value);
  const { issues, checking, hasIssues } = useSpellcheck(value, enabled);

  return (
    <label className="block text-sm">
      <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
        {label}
        {enabled ? (
          <SpellcheckBadge hasIssues={hasIssues} checking={checking} />
        ) : null}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          spellCheck
          lang="es"
          className={fieldClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          lang="es"
          className={fieldClass}
        />
      )}
      {enabled ? (
        <SpellcheckHints
          issues={issues}
          onApply={(issue, replacement) =>
            onChange(applySpellReplacement(value, issue, replacement))
          }
        />
      ) : null}
    </label>
  );
}

export function ImageField({
  label,
  media,
  token,
  onChange,
  site = "acropolis",
}: {
  label: string;
  media: CmsMedia;
  token: string | null;
  onChange: (m: CmsMedia) => void;
  site?: "acropolis" | "civis";
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(media.src);
  const pathHint = cmsUploadPathExample(site);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage(site, token, file);
      onChange({ ...media, src: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <EditField
        label="Ruta de la imagen (URL)"
        value={media.src}
        onChange={(v) => onChange({ ...media, src: v })}
      />
      <p className="text-xs leading-relaxed text-slate-600">
        Al subir, la ruta queda guardada como{" "}
        <code className="rounded bg-slate-100 px-1">{pathHint}</code>. También
        puedes pegar una ruta del sitio o de una foto ya subida.
      </p>
      <p className="text-xs text-amber-800">
        Recomendado: formato <strong>WebP</strong>.
      </p>
      <EditField
        label="Texto alternativo"
        value={media.alt}
        onChange={(v) => onChange({ ...media, alt: v })}
      />
      <EditField
        label="Crédito (opcional)"
        value={media.credit ?? ""}
        onChange={(v) => onChange({ ...media, credit: v || undefined })}
      />
      <label className="block text-sm">
        <span className="font-semibold text-slate-700">Subir foto</span>
        <input
          type="file"
          accept="image/webp,image/*,.webp"
          disabled={!token || uploading}
          className="mt-1 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
      </label>
      {uploading ? <p className="text-xs text-amber-700">Subiendo…</p> : null}
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt={media.alt || "Vista previa"}
          className="max-h-36 w-full rounded-lg object-cover"
        />
      ) : media.src.trim() ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          No se pudo cargar la vista previa. Revisa la ruta o sube de nuevo.
        </p>
      ) : null}
    </fieldset>
  );
}

export function BodyField({
  body,
  onChange,
  label = "Cuerpo (un párrafo por bloque)",
  addLabel = "+ Párrafo",
}: {
  body: string[];
  onChange: (v: string[]) => void;
  label?: string;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
          onClick={() => onChange([...body, ""])}
        >
          {addLabel}
        </button>
      </div>
      {body.map((p, pi) => (
        <BodyParagraphField
          key={pi}
          value={p}
          index={pi}
          onChange={(v) => {
            const next = [...body];
            next[pi] = v;
            onChange(next);
          }}
          onRemove={() => onChange(body.filter((_, j) => j !== pi))}
        />
      ))}
    </div>
  );
}

function BodyParagraphField({
  value,
  index,
  onChange,
  onRemove,
}: {
  value: string;
  index: number;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const { issues, checking, hasIssues } = useSpellcheck(value, true);

  return (
    <div className="flex gap-2">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
          Párrafo {index + 1}
          <SpellcheckBadge hasIssues={hasIssues} checking={checking} />
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          spellCheck
          lang="es"
          className="w-full rounded-lg border px-3 py-2 text-sm spellcheck-field"
        />
        <SpellcheckHints
          issues={issues}
          onApply={(issue, replacement) =>
            onChange(applySpellReplacement(value, issue, replacement))
          }
        />
      </div>
      <button
        type="button"
        className="shrink-0 self-start text-xs text-red-600"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}

export function GalleryField({
  images,
  token,
  onChange,
}: {
  images: CmsMedia[];
  token: string | null;
  onChange: (v: CmsMedia[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Galería (fotos extra)</span>
        <button
          type="button"
          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
          onClick={() => onChange([...images, { src: "", alt: "" }])}
        >
          + Foto
        </button>
      </div>
      {images.map((img, gi) => (
        <div key={gi} className="relative rounded-lg border p-3">
          <button
            type="button"
            className="absolute right-2 top-2 text-xs text-red-600"
            onClick={() => onChange(images.filter((_, j) => j !== gi))}
          >
            Quitar
          </button>
          <ImageField
            label={`Foto ${gi + 1}`}
            media={img}
            token={token}
            onChange={(m) => {
              const next = [...images];
              next[gi] = m;
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function EditPanelChrome({
  title,
  dirty,
  busy,
  status,
  onClose,
  onSave,
  children,
}: {
  title: string;
  dirty: boolean;
  busy: boolean;
  status: string;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-na-ink/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-bold text-na-heketDark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        <div className="space-y-2 border-t bg-slate-50 p-4">
          {status ? (
            <p className="text-center text-xs text-slate-600">{status}</p>
          ) : dirty ? (
            <p className="text-center text-xs text-amber-700">
              Cambios sin guardar en el servidor.
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="w-full rounded-lg bg-na-heket py-3 text-sm font-bold text-white hover:bg-na-heketDark disabled:opacity-50"
          >
            {busy ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border py-2 text-sm font-medium text-slate-600 hover:bg-white"
          >
            Cerrar panel
          </button>
        </div>
      </aside>
    </div>
  );
}

export function EditToolbar({
  label,
  dirty,
  busy,
  status,
  onSave,
  onPublish,
}: {
  label: string;
  dirty: boolean;
  busy: boolean;
  status: string;
  onSave: () => void;
  onPublish: () => void;
}) {
  const embeddedInEditor = useCmsEditorEmbedded();
  if (embeddedInEditor) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2">
        <p className="text-xs font-semibold text-amber-950 sm:text-sm">
          Modo edición — {label}
          {dirty ? (
            <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Sin guardar
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="rounded-lg bg-na-heket px-3 py-1.5 text-xs font-bold text-white hover:bg-na-heketDark disabled:opacity-50 sm:text-sm"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onPublish}
            className="rounded-lg bg-na-helios px-3 py-1.5 text-xs font-bold text-na-ink hover:brightness-105 disabled:opacity-50 sm:text-sm"
          >
            Publicar
          </button>
        </div>
      </div>
      {status ? (
        <p className="border-t border-amber-100 px-3 py-1 text-center text-xs text-amber-800">
          {status}
        </p>
      ) : (
        <p className="border-t border-amber-100 px-3 py-1 text-center text-[11px] text-amber-700">
          Clic en una tarjeta para editar. Luego <strong>Guardar borrador</strong>.
        </p>
      )}
    </div>
  );
}

export function HeroEditFields({
  value,
  onChange,
  carouselKey,
}: {
  value: { heroEyebrow?: string; heroTitle?: string; heroLede?: string };
  onChange: (patch: {
    heroEyebrow?: string;
    heroTitle?: string;
    heroLede?: string;
  }) => void;
  carouselKey?: CmsHeroCarouselKey;
}) {
  const carouselEdit = useHeroCarouselCmsEdit();

  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior (texto pequeño)"
        value={value.heroEyebrow ?? ""}
        onChange={(v) => onChange({ heroEyebrow: v })}
      />
      <EditField
        label="Título principal (h1)"
        value={value.heroTitle ?? ""}
        onChange={(v) => onChange({ heroTitle: v })}
      />
      <EditField
        label="Texto introductorio (h3)"
        value={value.heroLede ?? ""}
        onChange={(v) => onChange({ heroLede: v })}
        multiline
      />
      {carouselKey && carouselEdit?.ready ? (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">Fotos del carrusel del encabezado.</p>
          <button
            type="button"
            onClick={() => carouselEdit.openCarousel(carouselKey)}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Images className="h-4 w-4 shrink-0" aria-hidden />
            Editar fotos del carrusel
          </button>
        </div>
      ) : null}
    </div>
  );
}

