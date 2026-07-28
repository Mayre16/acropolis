"use client";

import { Pencil } from "lucide-react";

export function CmsEditPencil({
  label,
  onClick,
  className = "right-3 top-3",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-10 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow ${className}`}
      aria-label={label}
    >
      <Pencil className="h-4 w-4" />
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
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
