"use client";

import { useState } from "react";
import type { CmsDocument, SiteId } from "@/lib/content-types";
import { getApiUrl, uploadImage } from "@/lib/api";
import { previewPrincipalUrl } from "@/lib/preview-urls";

const DEFAULT_BROCHURE_HREF =
  "/docs/brochure-talleres-charlas-oinadom-esfera.pdf";
const DEFAULT_CV_HREF = "/docs/perfil-institucional-oinadom-feb-2026.pdf";

function resolvePublicHref(href: string) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  if (href.startsWith("/uploads/")) {
    return `${getApiUrl().replace(/\/$/, "")}${href}`;
  }
  const base = previewPrincipalUrl().replace(/\/$/, "");
  return `${base}${href.startsWith("/") ? href : `/${href}`}`;
}

function PdfDocumentCard({
  title,
  description,
  whereUsed,
  href,
  buttonLabel,
  onHrefChange,
  onButtonLabelChange,
  site,
  token,
  defaultHref,
}: {
  title: string;
  description: string;
  whereUsed: string;
  href: string;
  buttonLabel?: string;
  onHrefChange: (href: string) => void;
  onButtonLabelChange?: (label: string) => void;
  site: SiteId;
  token: string | null;
  defaultHref: string;
}) {
  const [uploading, setUploading] = useState(false);
  const effectiveHref = href || defaultHref;
  const publicHref = resolvePublicHref(effectiveHref);

  async function onFile(file: File | null) {
    if (!file || !token) return;
    setUploading(true);
    try {
      const url = await uploadImage(site, token, file);
      onHrefChange(url);
    } finally {
      setUploading(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-brand-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <p className="mt-2 text-xs text-slate-500">
        Visible en: <span className="font-medium text-slate-700">{whereUsed}</span>
      </p>

      <div className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Archivo (URL)
          <input
            className={field}
            value={href}
            placeholder={defaultHref}
            onChange={(e) => onHrefChange(e.target.value)}
          />
        </label>

        {onButtonLabelChange ? (
          <label className="block text-sm font-medium text-slate-700">
            Texto del botón
            <input
              className={field}
              value={buttonLabel ?? ""}
              onChange={(e) => onButtonLabelChange(e.target.value)}
            />
          </label>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          Subir PDF nuevo
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={!token || uploading}
            className="mt-1 block w-full text-sm"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {uploading ? <p className="text-sm text-slate-500">Subiendo PDF…</p> : null}

        {publicHref ? (
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold text-brand-teal hover:underline"
          >
            Ver documento actual
          </a>
        ) : null}
      </div>
    </section>
  );
}

type ArchivosDocumentsPanelProps = {
  site: SiteId;
  doc: CmsDocument;
  token: string | null;
  onChange: (doc: CmsDocument) => void;
};

export function ArchivosDocumentsPanel({
  site,
  doc,
  token,
  onChange,
}: ArchivosDocumentsPanelProps) {
  if (site !== "acropolis") return null;

  const esfera = doc.sections?.esferaPage ?? {};
  const quienesSomos = doc.sections?.quienesSomosPage ?? {};

  function patchSections(patch: Partial<NonNullable<CmsDocument["sections"]>>) {
    onChange({
      ...doc,
      sections: {
        ...doc.sections,
        ...patch,
      },
    });
  }

  return (
    <div className="mb-8 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-ink">Documentos del sitio</h2>
        <p className="mt-1 text-sm text-slate-600">
          Sube una nueva versión del PDF y guarda el borrador. Luego publica para
          que el cambio se vea en el sitio.
        </p>
      </div>

      <PdfDocumentCard
        title="Brochure Esfera"
        description="PDF de talleres y charlas del Punto Focal Esfera."
        whereUsed="Página Esfera — botón de descarga en la sección de modalidades"
        href={esfera.brochureHref ?? ""}
        buttonLabel={esfera.brochureButtonLabel ?? "Descarga nuestro brochure"}
        defaultHref={DEFAULT_BROCHURE_HREF}
        site={site}
        token={token}
        onHrefChange={(brochureHref) =>
          patchSections({
            esferaPage: { ...esfera, brochureHref },
          })
        }
        onButtonLabelChange={(brochureButtonLabel) =>
          patchSections({
            esferaPage: { ...esfera, brochureButtonLabel },
          })
        }
      />

      <PdfDocumentCard
        title="CV institucional (OINADOM)"
        description="Perfil institucional en PDF para descarga pública."
        whereUsed="Página Quiénes somos — sección de perfil institucional"
        href={quienesSomos.perfilInstitucionalHref ?? ""}
        buttonLabel={
          quienesSomos.perfilInstitucionalButtonLabel ??
          "Descargar perfil institucional (PDF)"
        }
        defaultHref={DEFAULT_CV_HREF}
        site={site}
        token={token}
        onHrefChange={(perfilInstitucionalHref) =>
          patchSections({
            quienesSomosPage: { ...quienesSomos, perfilInstitucionalHref },
          })
        }
        onButtonLabelChange={(perfilInstitucionalButtonLabel) =>
          patchSections({
            quienesSomosPage: { ...quienesSomos, perfilInstitucionalButtonLabel },
          })
        }
      />
    </div>
  );
}
