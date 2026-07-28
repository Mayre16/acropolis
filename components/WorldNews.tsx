"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";

export type WorldItem = {
  title: string;
  excerpt: string;
  date?: string;
  image?: string;
  /** Enlace al artículo original (acropolis.org u otra fuente). */
  url?: string;
};

const FEED_SOURCES = [
  process.env.NEXT_PUBLIC_NA_FEED_URL,
  "/api/na-feed.php",
  "/data/mundo-feed.json",
].filter(Boolean) as string[];

async function loadWorldItems(): Promise<WorldItem[] | null> {
  const tried = new Set<string>();
  for (const source of FEED_SOURCES) {
    if (tried.has(source)) continue;
    tried.add(source);
    try {
      const res = await fetch(source);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data?.items) && data.items.length > 0) {
        return data.items.slice(0, 6) as WorldItem[];
      }
    } catch {
      /* siguiente fuente */
    }
  }
  return null;
}

/** Noticias internacionales con enlace externo en nueva pestaña. */
export function WorldNews({ fallback }: { fallback: WorldItem[] }) {
  const [items, setItems] = useState<WorldItem[]>(fallback);

  useEffect(() => {
    let active = true;
    loadWorldItems().then((loaded) => {
      if (active && loaded) setItems(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const cardClass =
          "flex h-full flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card";

        const card = (
          <>
            <div className="relative aspect-[16/10] w-full bg-na-heket/5">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-na-heket/10 text-na-heket">
                  <Globe2 className="h-10 w-10" strokeWidth={1.5} />
                </div>
              )}
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-na-kefer px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                <Globe2 className="h-3 w-3" /> En el mundo
              </span>
              {item.url ? (
                <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-na-heketDark shadow">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-5">
              {item.date ? (
                <p className="text-xs font-semibold text-na-kefer">{item.date}</p>
              ) : null}
              <h3 className="mt-1 text-lg font-black leading-snug text-na-heketDark">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                {item.excerpt}
              </p>
            </div>
          </>
        );

        return (
          <li key={`${item.title}-${item.date ?? ""}`}>
            {item.url ? (
              <LeaveSiteLink href={item.url} className={`group ${cardClass}`}>
                {card}
              </LeaveSiteLink>
            ) : (
              <div className={cardClass}>{card}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
