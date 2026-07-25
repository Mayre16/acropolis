import type { CmsMedia } from "@/lib/content-types";
import { CMS_IMAGE_ACCEPT } from "@/lib/upload-file-validate";

export function MediaField({
  label,
  media,
  onChange,
  onUpload,
}: {
  label: string;
  media: CmsMedia & { objectPosition?: string };
  onChange: (m: CmsMedia & { objectPosition?: string }) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
  showObjectPosition?: boolean;
}) {
  const safe: CmsMedia & { objectPosition?: string } = {
    src: media?.src ?? "",
    alt: media?.alt ?? "",
    credit: media?.credit,
    objectPosition: media?.objectPosition,
  };
  return (
    <fieldset className="rounded-lg border border-slate-200 p-3 space-y-2">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <label className="block text-sm">
        <span className="text-slate-600">URL imagen</span>
        <input
          value={safe.src}
          onChange={(e) => onChange({ ...safe, src: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Texto alternativo</span>
        <input
          value={safe.alt}
          onChange={(e) => onChange({ ...safe, alt: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Crédito (opcional)</span>
        <input
          value={safe.credit ?? ""}
          onChange={(e) => onChange({ ...safe, credit: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      {media != null && "objectPosition" in media ? (
        <label className="block text-sm">
          <span className="text-slate-600">Posición (opcional, ej. 50% 30%)</span>
          <input
            value={safe.objectPosition ?? ""}
            onChange={(e) =>
              onChange({ ...safe, objectPosition: e.target.value || undefined })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="text-slate-600">Subir foto (WebP, JPG o PNG)</span>
        <input
          type="file"
          accept={CMS_IMAGE_ACCEPT}
          className="mt-1 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f, (url) => onChange({ ...safe, src: url }));
            e.target.value = "";
          }}
        />
      </label>
      {safe.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safe.src}
          alt={safe.alt || "Vista previa"}
          className="mt-2 max-h-32 rounded-lg object-cover"
        />
      ) : null}
    </fieldset>
  );
}

export function GalleryEditor({
  images,
  onChange,
  onUpload,
}: {
  images: CmsMedia[];
  onChange: (v: CmsMedia[]) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Galería de fotos (1 o varias, debajo del cuerpo)
        </span>
        <button
          type="button"
          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
          onClick={() =>
            onChange([...images, { src: "", alt: "" }])
          }
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
          <MediaField
            label={`Foto ${gi + 1}`}
            media={img}
            onChange={(m) => {
              const next = [...images];
              next[gi] = m;
              onChange(next);
            }}
            onUpload={onUpload}
          />
        </div>
      ))}
      {!images.length ? (
        <p className="text-xs text-slate-500">
          Sin fotos extra. Usa «+ Foto» para añadir una sesión con 1 o más imágenes.
        </p>
      ) : null}
    </div>
  );
}

export function BodyEditor({
  body,
  onChange,
}: {
  body: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Cuerpo (un párrafo por bloque)</span>
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
          <textarea
            value={p}
            onChange={(e) => {
              const next = [...body];
              next[pi] = e.target.value;
              onChange(next);
            }}
            rows={3}
            placeholder={
              pi === 0
                ? "Primer párrafo (lead, más destacado)"
                : "Párrafo o mini-título (línea corta = subtítulo en entradas del blog)"
            }
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
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
