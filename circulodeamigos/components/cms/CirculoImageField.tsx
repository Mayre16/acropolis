"use client";

import { useState } from "react";
import { EditField } from "@/components/cms/CmsEditFields";
import {
  cmsUploadPathExample,
  resolveCmsMediaUrl,
  uploadCmsImage,
} from "@/lib/cms/api-client";
import { CMS_IMAGE_ACCEPT } from "@/lib/cms/upload-file-validate";

export function CirculoImageField({
  image,
  imageAlt,
  token,
  onChange,
  label = "Foto",
}: {
  image: string;
  imageAlt: string;
  token: string | null;
  onChange: (patch: { image?: string; imageAlt?: string }) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(image);
  const pathHint = cmsUploadPathExample("circulodeamigos");

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("circulodeamigos", token, file);
      onChange({ image: url });
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
        value={image}
        onChange={(v) => onChange({ image: v })}
      />
      <p className="text-xs leading-relaxed text-slate-600">
        Al subir, se guarda una ruta como{" "}
        <code className="rounded bg-slate-100 px-1">{pathHint}</code>.
        Si pegas un link, usa esa misma forma (no la ruta del File Manager de
        cPanel). Ejemplo: foto ya subida →{" "}
        <code className="rounded bg-slate-100 px-1">
          /uploads/circulodeamigos/1234-abcd.webp
        </code>
        .
      </p>
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt={imageAlt || "Vista previa"}
          className="h-28 w-full rounded-lg object-cover"
        />
      ) : null}
      <p className="text-xs text-amber-800">
        Solo fotos <strong>WebP, JPG o PNG</strong> (máx. 8 MB). No PDF.
      </p>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-700">Subir foto</span>
        <input
          type="file"
          accept={CMS_IMAGE_ACCEPT}
          disabled={!token || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
      </label>
      <EditField
        label="Texto alternativo"
        value={imageAlt}
        onChange={(v) => onChange({ imageAlt: v })}
      />
    </fieldset>
  );
}
