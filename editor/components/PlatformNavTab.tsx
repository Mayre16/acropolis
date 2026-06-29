"use client";

import type { CmsDocument, CmsPlatformNav } from "@/lib/content-types";

type PlatformId = "biblioteca" | "civis" | "tienda";

const PLATFORM_ORDER: PlatformId[] = ["biblioteca", "tienda", "civis"];

const PLATFORM_LABELS: Record<PlatformId, string> = {
  biblioteca: "Biblioteca",
  tienda: "Librería Editorial Logos",
  civis: "Civis",
};

const DEFAULT_URLS: Record<PlatformId, string> = {
  biblioteca: "https://biblioteca-oina.adesa.com.do",
  civis: "https://civis.acropolis.adesa.com.do",
  tienda: "https://tienda.acropolis.adesa.com.do",
};

const GITHUB_URLS: Record<PlatformId, string> = {
  biblioteca: DEFAULT_URLS.biblioteca,
  civis: "https://mayre16.github.io/acropolis/civis/",
  tienda: "https://mayre16.github.io/acropolis/tienda/",
};

function isVisible(nav: CmsPlatformNav, id: PlatformId): boolean {
  return !(nav.hidden ?? []).includes(id);
}

function setVisible(nav: CmsPlatformNav, id: PlatformId, visible: boolean): CmsPlatformNav {
  const hidden = new Set(nav.hidden ?? []);
  if (visible) hidden.delete(id);
  else hidden.add(id);
  return { ...nav, hidden: [...hidden] };
}

function setUrl(nav: CmsPlatformNav, id: PlatformId, url: string): CmsPlatformNav {
  const trimmed = url.trim();
  const urls = { ...(nav.urls ?? {}) };
  if (trimmed) urls[id] = trimmed;
  else delete urls[id];
  return {
    ...nav,
    urls: Object.keys(urls).length > 0 ? urls : undefined,
  };
}

function applyGithub(nav: CmsPlatformNav): CmsPlatformNav {
  return { ...nav, urls: { ...nav.urls, ...GITHUB_URLS } };
}

export function PlatformNavTab({
  nav,
  onChange,
}: {
  nav: CmsPlatformNav;
  onChange: (next: CmsPlatformNav) => void;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-4">
      <div>
        <h2 className="text-base font-bold text-brand-ink">
          Enlaces de la bandeja superior
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Franja verde con Biblioteca, Librería Editorial Logos y Civis. Deja la
          URL vacía para usar el dominio por defecto del código. Puedes poner
          GitHub Pages ahora y cambiar al servidor oficial cuando esté listo.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(applyGithub(nav))}
        className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100"
      >
        Rellenar URLs de GitHub Pages (Civis y Tienda)
      </button>

      <ul className="space-y-4">
        {PLATFORM_ORDER.map((id) => {
          const customUrl = nav.urls?.[id] ?? "";
          const visible = isVisible(nav, id);
          return (
            <li
              key={id}
              className="space-y-3 rounded-xl border border-slate-200 p-3"
            >
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) =>
                    onChange(setVisible(nav, id, e.target.checked))
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {PLATFORM_LABELS[id]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {visible ? "Visible" : "Oculto en la bandeja"}
                  </span>
                </span>
              </label>

              <label className="block text-sm">
                <span className="font-medium">URL del enlace</span>
                <input
                  type="url"
                  value={customUrl}
                  placeholder={DEFAULT_URLS[id]}
                  onChange={(e) => onChange(setUrl(nav, id, e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  {customUrl.trim()
                    ? `Destino: ${customUrl.trim()}`
                    : `Predeterminado: ${DEFAULT_URLS[id]}`}
                </span>
                {GITHUB_URLS[id] !== DEFAULT_URLS[id] ? (
                  <button
                    type="button"
                    onClick={() => onChange(setUrl(nav, id, GITHUB_URLS[id]))}
                    className="mt-1 text-xs font-semibold text-brand-teal hover:underline"
                  >
                    Usar GitHub: {GITHUB_URLS[id]}
                  </button>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function mergePlatformNavSection(
  doc: CmsDocument,
  platformNav: CmsPlatformNav,
): CmsDocument {
  return {
    ...doc,
    sections: {
      ...doc.sections,
      platformNav,
    },
  };
}
