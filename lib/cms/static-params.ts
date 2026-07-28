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
      const res = await fetch(`${base}/content/acropolis/published`, {
        cache: "no-store",
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

