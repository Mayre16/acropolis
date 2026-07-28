"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { esferaPrincipioSelectedId } from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

export function EsferaPrincipiosSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const principios = page.principios ?? [];

  return (
    <div className="mt-14 border-t border-na-heket/10 pt-14">
      {edit?.ready ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => edit.addPrincipio()}
            className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir tarjeta
          </button>
        </div>
      ) : null}

      <ul className="grid gap-6 md:grid-cols-3">
        {principios.map(({ id, src, alt, title, text }) => {
          const imageSrc = resolveCmsMediaUrl(src) ?? src;
          return (
            <li
              key={id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
            >
              {edit?.ready ? (
                <CmsEditPencil
                  label={`Editar ${title}`}
                  onClick={() =>
                    edit.setSelectedId(esferaPrincipioSelectedId(id))
                  }
                />
              ) : null}
              <div className="relative aspect-[4/3] overflow-hidden">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={alt}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : edit?.ready ? (
                  <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                    Sin imagen — clic en lápiz
                  </div>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-na-heketDark">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                  {text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
