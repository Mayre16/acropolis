"use client";

import { useState, type ReactNode } from "react";
import {
  cmsUploadPathExample,
  resolveCmsMediaUrl,
  uploadCmsImage,
} from "@/lib/cms/api-client";
import type { CmsMedia } from "@/lib/cms/types";
import { useCmsEditorEmbedded } from "@/hooks/useCmsEditorEmbedded";

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export function EditField({
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
    </label>
  );
}

export function ImageField({
  label,
  media,
  token,
  onChange,
  objectPosition,
  onObjectPositionChange,
}: {
  label: string;
  media: CmsMedia & { objectPosition?: string };
  token: string | null;
  onChange: (m: CmsMedia & { objectPosition?: string }) => void;
  objectPosition?: string;
  onObjectPositionChange?: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(media.src);
  const pathHint = cmsUploadPathExample("civis");

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("civis", token, file);
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
      {onObjectPositionChange ? (
        <EditField
          label="Encuadre (object-position)"
          value={objectPosition ?? media.objectPosition ?? ""}
          onChange={(v) => {
            onObjectPositionChange(v);
            onChange({ ...media, objectPosition: v || undefined });
          }}
        />
      ) : null}
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
          style={{ objectPosition: media.objectPosition ?? "50% 30%" }}
        />
      ) : media.src.trim() ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          No se pudo cargar la vista previa. Revisa la ruta o sube de nuevo.
        </p>
      ) : null}
    </fieldset>
  );
}

export function ParagraphsField({
  paragraphs,
  onChange,
  label = "Párrafos",
}: {
  paragraphs: string[];
  onChange: (v: string[]) => void;
  label?: string;
}) {
  const body = paragraphs.length > 0 ? paragraphs : [""];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
          onClick={() => onChange([...body, ""])}
        >
          + Párrafo
        </button>
      </div>
      {body.map((p, pi) => (
        <div key={pi} className="flex gap-2">
          <label className="min-w-0 flex-1 block text-sm">
            <span className="text-xs font-semibold text-slate-600">
              Párrafo {pi + 1}
            </span>
            <textarea
              value={p}
              onChange={(e) => {
                const next = [...body];
                next[pi] = e.target.value;
                onChange(next);
              }}
              rows={3}
              spellCheck
              lang="es"
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            className="shrink-0 self-start text-xs text-red-600"
            onClick={() => onChange(body.filter((_, j) => j !== pi))}
          >
            ×
          </button>
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
          <h3 className="font-bold text-na-ink">{title}</h3>
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
            className="w-full rounded-lg bg-na-civis py-3 text-sm font-bold text-white hover:bg-na-civisDark disabled:opacity-50"
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
            className="rounded-lg bg-na-civis px-3 py-1.5 text-xs font-bold text-white hover:bg-na-civisDark disabled:opacity-50 sm:text-sm"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onPublish}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50 sm:text-sm"
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
          Clic en <strong>✎</strong> para editar. Luego{" "}
          <strong>Guardar borrador</strong>.
        </p>
      )}
    </div>
  );
}

export function SectionCopyFields({
  value,
  onChange,
}: {
  value: { eyebrow?: string; title?: string; lede?: string };
  onChange: (patch: { eyebrow?: string; title?: string; lede?: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior"
        value={value.eyebrow ?? ""}
        onChange={(v) => onChange({ eyebrow: v })}
      />
      <EditField
        label="Título (h2)"
        value={value.title ?? ""}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Texto introductorio (h3)"
        value={value.lede ?? ""}
        onChange={(v) => onChange({ lede: v })}
        multiline
      />
    </div>
  );
}

export function CivisEditPencil({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-amber-950 shadow-md transition hover:bg-amber-500 ${className}`}
      aria-label={label}
      title={label}
    >
      ✎
    </button>
  );
}

export function CmsSectionEditBar({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
    >
      ✎ {label}
    </button>
  );
}
