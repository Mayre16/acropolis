"use client";

import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  Library,
  Pencil,
  ShoppingBag,
} from "lucide-react";
import { usePlatformNavCmsEdit } from "@/components/cms/PlatformNavCmsEditContext";
import { useMergedPlatformNavItems } from "@/lib/cms/hooks";
import { type PlatformId } from "@/lib/site-config";

const ICONS: Record<PlatformId, typeof Library> = {
  biblioteca: Library,
  tienda: ShoppingBag,
  civis: Briefcase,
};

function itemClassName(id: PlatformId): string {
  const base =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition sm:px-3.5 sm:text-xs ";

  switch (id) {
    case "tienda":
      return base + "bg-na-editorial text-white hover:bg-na-editorialDark";
    case "civis":
      return base + "bg-na-civis text-white hover:bg-na-civisDark";
    case "biblioteca":
      return base + "bg-na-helios text-na-ink hover:brightness-105";
    default:
      return base + "bg-white/15 text-white hover:bg-white/25";
  }
}

export function PlatformNavBar() {
  const items = useMergedPlatformNavItems();
  const edit = usePlatformNavCmsEdit();

  return (
    <div className="border-b border-na-heket/15 bg-na-heket text-white">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-end gap-2 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = ICONS[item.id];
          const className = itemClassName(item.id);
          const content = (
            <>
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {item.label}
              {item.external ? (
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
              ) : null}
            </>
          );

          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
        {edit?.ready ? (
          <button
            type="button"
            onClick={edit.openPanel}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-white/20 sm:px-3.5 sm:text-xs"
            aria-label="Editar enlaces de la bandeja superior (Biblioteca, Librería, Civis)"
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Editar enlaces
          </button>
        ) : null}
      </div>
    </div>
  );
}
