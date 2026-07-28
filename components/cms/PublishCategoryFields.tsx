"use client";

import type { AgendaCategory } from "@/lib/agenda";
import {
  PUBLISH_CATEGORY_DEFS,
  PUBLISH_CATEGORY_GROUPS,
  publishCategoryDef,
} from "@/lib/agenda-publish-categories";

export function PublishCategorySelect({
  value,
  onChange,
  id = "publish-category",
}: {
  value: AgendaCategory;
  onChange: (category: AgendaCategory) => void;
  id?: string;
}) {
  const def = publishCategoryDef(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm" htmlFor={id}>
        <span className="mb-1 block font-semibold text-slate-700">
          Categoría
        </span>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as AgendaCategory)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          {PUBLISH_CATEGORY_GROUPS.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {PUBLISH_CATEGORY_DEFS.filter((d) => d.group === group.id).map(
                (option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ),
              )}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-xs text-sky-950">
        <p className="font-semibold">Se publicará en:</p>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5">
          {def.pages.map((page) => (
            <li key={page.path}>
              <span className="font-medium">{page.label}</span>
              <span className="text-sky-800"> — {page.path}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SeoTagsField({
  value,
  onChange,
  category,
  label = "Etiquetas para búsqueda (SEO)",
}: {
  value: string[] | undefined;
  onChange: (tags: string[]) => void;
  category: AgendaCategory;
  label?: string;
}) {
  const suggested = publishCategoryDef(category).suggestedSeoTags;

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">{label}</span>
        <input
          type="text"
          value={(value ?? []).join(", ")}
          onChange={(e) => {
            const tags = e.target.value
              .split(/[,;]+/)
              .map((t) => t.trim().toLocaleLowerCase("es"))
              .filter(Boolean);
            onChange([...new Set(tags)]);
          }}
          placeholder={suggested.join(", ")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <p className="text-xs text-slate-600">
        Separa con comas. Sugeridas para esta categoría:{" "}
        <span className="text-slate-800">{suggested.join(", ")}</span>. Ayudan
        a que Google y la agenda encuentren la actividad.
      </p>
    </div>
  );
}
