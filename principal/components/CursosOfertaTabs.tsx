"use client";

import Image from "next/image";
import { EyeOff, MapPin, Pencil, Plus, User } from "lucide-react";
import { CourseInscribeButton } from "@/components/CourseInscribeButton";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";
import { ofertaSelectedId } from "@/lib/cms/cursos-oferta-edit";
import { useCursosOfertaDisplay } from "@/lib/cms/cursos-display";
import { splitCursosOferta } from "@/lib/cursos-permanentes";
import type { CmsCursosCard } from "@/lib/cms/types";
import {
  accentCardShell,
  accentEyebrowClass,
  accentTokens,
} from "@/lib/brand-accents";

function OfertaHiddenGrid({
  items,
  onEdit,
  onRestore,
}: {
  items: CmsCursosCard[];
  onEdit: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <li
          key={c.id}
          className="relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-white/80 opacity-90"
        >
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-950">
            <EyeOff className="h-3.5 w-3.5" />
            Oculto del sitio
          </div>
          <div className="flex flex-1 flex-col p-4">
            <p className="font-bold text-na-heketDark">{c.title}</p>
            {c.text ? (
              <p className="mt-1 line-clamp-2 text-sm text-na-muted">{c.text}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(c.id)}
                className="inline-flex items-center gap-1 rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-950"
              >
                <Pencil className="h-3 w-3" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onRestore(c.id)}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Mostrar de nuevo
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OfertaGrid({
  items,
  onEdit,
}: {
  items: CmsCursosCard[];
  onEdit?: (id: string) => void;
}) {
  return (
    <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => {
        const a = accentTokens(i);
        const badge = c.tag;

        return (
          <li
            key={c.id}
            className={`relative flex flex-col overflow-hidden ${accentCardShell(i)}`}
          >
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(c.id)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                aria-label={`Editar ${c.title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-na-heket/5">
              {c.src?.trim() ? (
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-na-muted">
                  Sin imagen
                </div>
              )}
              {badge ? (
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur ${a.iconWrap} ${a.icon}`}
                >
                  {badge}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <OfertaFormativaItem
                title={c.title}
                intro={c.text}
                titleClassName="text-lg"
                introClassName="mt-2 flex-1"
              />
              {c.fechaApertura ? (
                <p className="mt-3 text-xs font-semibold text-na-kefer">
                  {c.fechaApertura}
                </p>
              ) : null}
              {(c.facilitador || c.sede) && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-na-heket/10 pt-3 text-xs font-semibold text-na-muted">
                  {c.facilitador ? (
                    <span className="inline-flex items-center gap-1.5">
                      <User className={`h-3.5 w-3.5 ${a.icon}`} />
                      {c.facilitador}
                    </span>
                  ) : null}
                  {c.sede ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className={`h-3.5 w-3.5 ${a.icon}`} />
                      {c.sede}
                    </span>
                  ) : null}
                </div>
              )}
              <CourseInscribeButton
                title={c.title}
                kind={c.inscribeKind ?? "curso"}
                sede={c.sede}
                facilitador={c.facilitador}
                accentIndex={i}
                label={c.inscribeLabel?.trim() || "Solicitar info"}
                whatsappNumber={c.inscribeWhatsappNumber}
                whatsappMessage={c.inscribeWhatsappMessage}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CursosOfertaTabs() {
  const edit = useCursosCmsEdit();
  const display = useCursosOfertaDisplay();

  if (edit?.ready) {
    const editItems = edit.getOfertaCards("cursos");
    const hiddenItems = edit.getHiddenOfertaCards("cursos");
    const { permanentes, otros } = splitCursosOferta(editItems);
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={accentEyebrowClass(0)}>
              {edit.page.ofertaEyebrow ?? display.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              Cursos activos
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => edit.setSelectedId("__ofertaSection__")}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar textos
            </button>
            <button
              type="button"
              onClick={() => edit.addOfertaCard("cursos")}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir curso
            </button>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-na-muted">
          {edit.page.ofertaCursosIntro ?? display.cursosIntro}
        </p>
        {permanentes.length > 0 ? (
          <OfertaGrid
            items={permanentes}
            onEdit={(id) => edit.setSelectedId(ofertaSelectedId("cursos", id))}
          />
        ) : null}
        {otros.length > 0 ? (
          <>
            <h3
              id="otros-cursos"
              className="mt-14 scroll-mt-24 text-2xl font-black text-na-heketDark sm:text-3xl"
            >
              Otros cursos y talleres
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-na-muted">
              Actividades por temporadas y convocatorias especiales.
            </p>
            <OfertaGrid
              items={otros}
              onEdit={(id) => edit.setSelectedId(ofertaSelectedId("cursos", id))}
            />
          </>
        ) : null}
        {hiddenItems.length > 0 ? (
          <div
            id="cursos-ocultos"
            className="mt-14 scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8"
          >
            <h3 className="text-xl font-black text-amber-950 sm:text-2xl">
              Ocultos del catálogo
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-amber-950/80">
              Estos cursos no se muestran en la web pública. Puedes editarlos o
              volver a publicarlos desde aquí.
            </p>
            <OfertaHiddenGrid
              items={hiddenItems}
              onEdit={(id) => edit.setSelectedId(ofertaSelectedId("cursos", id))}
              onRestore={(id) => edit.restoreOfertaCard("cursos", id)}
            />
          </div>
        ) : null}
      </section>
    );
  }

  const { permanentes, otros } = splitCursosOferta(display.cursosTalleres);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <p className={accentEyebrowClass(0)}>{display.eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
        Cursos activos
      </h2>
      <p className="mt-6 max-w-2xl text-na-muted">{display.cursosIntro}</p>
      {permanentes.length > 0 ? (
        <OfertaGrid items={permanentes} />
      ) : null}
      {otros.length > 0 ? (
        <>
          <h3
            id="otros-cursos"
            className="mt-14 scroll-mt-24 text-2xl font-black text-na-heketDark sm:text-3xl"
          >
            Otros cursos y talleres
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-na-muted">
            Actividades por temporadas y convocatorias especiales.
          </p>
          <OfertaGrid items={otros} />
        </>
      ) : null}
    </section>
  );
}
