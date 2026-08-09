import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { ARTICULOS } from "@/lib/articulos";
import { EVENTOS } from "@/lib/eventos";
import { VIAJES_DESTINOS } from "@/lib/viajes";
import { mergeArticulos, mergeEventos, mergeViajes } from "@/lib/cms/merge-content";
import type { CmsDocument } from "@/lib/cms/types";

const LOCAL_CMS_PATHS = [
  join(process.cwd(), "../editor/data/acropolis/published.json"),
  join(process.cwd(), "../editor/data/acropolis/draft.json"),
  join(process.cwd(), "data/acropolis/published.json"),
];

function readLocalCms(): CmsDocument | null {
  for (const p of LOCAL_CMS_PATHS) {
    if (!existsSync(p)) continue;
    try {
      const raw = readFileSync(p, "utf8");
      const doc = JSON.parse(raw) as CmsDocument;
      if (doc?.version === 1) return doc;
    } catch {
      /* siguiente ruta */
    }
  }
  return null;
}

export async function loadPublishedCms(): Promise<CmsDocument | null> {
  const base = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  if (base) {
    try {
      // force-cache: en `output: "export"` el no-store puede vaciar generateMetadata
      // (sin og:image el compartir no muestra preview de la foto).
      const res = await fetch(`${base}/content/acropolis/published`, {
        cache: "force-cache",
      });
      if (res.ok) {
        const doc = (await res.json()) as CmsDocument;
        if (doc?.version === 1) return doc;
      }
    } catch {
      /* fallback a archivo local */
    }
  }
  return readLocalCms();
}

/** URL absoluta pública de un upload CMS (para og:image / crawlers). */
export function absoluteCmsUploadUrl(src?: string): string | undefined {
  if (!src?.trim()) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  const path = src.match(
    /(\/uploads\/(?:acropolis|civis|editorial|circulodeamigos)\/[^\s"?#]+)/,
  )?.[1];
  if (!path) return undefined;
  const api = (
    process.env.NEXT_PUBLIC_CMS_URL?.trim() ||
    "https://editor.acropolis.adesa.com.do/api"
  ).replace(/\/$/, "");
  return `${api}${path}`;
}

export async function getArticuloStaticParams() {
  const cms = await loadPublishedCms();
  const merged = mergeArticulos(ARTICULOS, cms);
  return merged.map((a) => ({ articulo: a.slug }));
}

export async function getEventoStaticParams() {
  const cms = await loadPublishedCms();
  const merged = mergeEventos(EVENTOS, cms);
  return merged.map((e) => ({ slug: e.slug }));
}

export async function getMergedArticulo(slug: string) {
  const cms = await loadPublishedCms();
  const merged = mergeArticulos(ARTICULOS, cms);
  return merged.find((a) => a.slug === slug) ?? null;
}

export async function getMergedEvento(slug: string) {
  const cms = await loadPublishedCms();
  const merged = mergeEventos(EVENTOS, cms);
  return merged.find((e) => e.slug === slug) ?? null;
}

export async function getViajeStaticParams() {
  const cms = await loadPublishedCms();
  const merged = mergeViajes(VIAJES_DESTINOS, cms);
  return merged
    .filter((v) => !v.soloEnlace)
    .map((v) => ({ categoria: v.categoria, slug: v.slug }));
}

export async function getMergedViaje(categoria: string, slug: string) {
  const cms = await loadPublishedCms();
  const merged = mergeViajes(VIAJES_DESTINOS, cms);
  return (
    merged.find((v) => v.categoria === categoria && v.slug === slug) ?? null
  );
}

import { DIAS_FRASE, getIndexFromSlug } from "@/lib/frases-del-dia-share";

export async function getFraseDelDiaStaticParams() {
  return DIAS_FRASE.map((d) => ({ id: d.slug }));
}

export async function getMergedFraseDelDia(slugOrId: string) {
  const cms = await loadPublishedCms();
  const list = cms?.sections.frasesDelDia ?? [];
  
  const dayIndex = getIndexFromSlug(slugOrId);
  const fraseByIndex = list[dayIndex];
  if (fraseByIndex?.src?.trim()) {
    return { ...fraseByIndex, dayIndex };
  }
  
  const fraseById = list.find((f) => f.id === slugOrId && f.src?.trim());
  if (fraseById) {
    const idx = list.indexOf(fraseById);
    return { ...fraseById, dayIndex: idx >= 0 ? idx : 0 };
  }
  
  return null;
}

