"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import type { BrandLockupId } from "@/lib/brand-assets";
import type { HeroImage } from "@/lib/hero-images";

type CmsPageHeroProps = {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  crumbs?: { label: string; href?: string }[];
  images?: HeroImage[];
  brandMark?: "na" | "esfera";
  brandLockup?: BrandLockupId;
  imageObjectPosition?: string;
  layout?: "background" | "split";
  editReady?: boolean;
  onEdit?: () => void;
  editLabel?: string;
  children?: ReactNode;
};

export function CmsPageHero({
  id,
  editReady,
  onEdit,
  editLabel = "Editar encabezado",
  children,
  ...heroProps
}: CmsPageHeroProps) {
  return (
    <div id={id} className="relative scroll-mt-24">
      <PageHero {...heroProps} />
      {children}
      {editReady && onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-4 top-24 z-20 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg"
        >
          <Pencil className="h-4 w-4" />
          {editLabel}
        </button>
      ) : null}
    </div>
  );
}
