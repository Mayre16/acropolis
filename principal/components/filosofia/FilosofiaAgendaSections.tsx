"use client";

import { Pencil, Plus } from "lucide-react";
import { getActiveAgendaItems, type AgendaEntry } from "@/lib/agenda";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import type { CmsAgendaEntry } from "@/lib/cms/types";
import { useCmsFilosofiaPageAgenda } from "@/lib/cms/hooks";
import { UpcomingAgenda } from "@/components/UpcomingAgenda";
import { AgendaCardBody, AgendaCardThumbnail } from "@/components/ContentCardMedia";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";

const DEFAULT_INSCRIBE =
  "Hola, me interesa el Diplomado de Filosofía para la Vida. ¿Me dan información de fechas e inscripción?";

function toDisplay(entries: CmsAgendaEntry[]): AgendaEntry[] {
  return getActiveAgendaItems(entries.map(cmsEntryToAgenda)).map((e) => ({
    ...e,
    image: resolveCmsMediaUrl(e.image),
  }));
}

function AgendaCardGrid({
  items,
  list,
  onEdit,
}: {
  items: AgendaEntry[];
  list: CmsAgendaEntry[];
  onEdit: (id: string) => void;
}) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => {
        const a = accentTokens(i);
        const cmsItem = list.find((d) => d.id === it.id);
        return (
          <li key={it.id} className="flex">
            <button
              type="button"
              onClick={() => it.id && onEdit(it.id)}
              className={`group relative flex h-full w-full items-stretch gap-4 overflow-hidden p-5 text-left transition ${accentCardShell(i)} hover:ring-2 hover:ring-amber-400/70 hover:ring-offset-1`}
            >
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow">
                <Pencil className="h-4 w-4" aria-hidden />
              </span>
              <AgendaCardThumbnail
                src={it.image}
                alt={it.imageAlt ?? it.title}
              />
              <AgendaCardBody
                className="pr-8"
                tag={it.tag}
                title={it.title}
                date={it.date || cmsItem?.startsAt}
                time={it.time}
                sede={it.sede}
                iconClass={a.icon}
                iconWrapClass={a.iconWrap}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function FilosofiaAgendaEditZones() {
  const edit = useFilosofiaCmsEdit();
  if (!edit?.ready) return null;

  const diplomadoItems = toDisplay(edit.diplomadoAgenda);
  const otrasItems = toDisplay(edit.otrasAgenda);

  return (
    <>
      <div
        id="filosofia-badge"
        className="scroll-mt-24 border-b border-amber-100 bg-amber-50/80 px-4 py-3 text-center"
      >
        <button
          type="button"
          onClick={() => edit.setActiveSection("badge")}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-amber-900 ring-1 ring-amber-300 hover:bg-amber-100"
        >
          <Pencil className="h-4 w-4" />
          Editar badge del diplomado (home /diplomado)
        </button>
      </div>

      <section
        id="proximas-sesiones"
        className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => edit.setActiveSection("sesiones")}
              className="absolute right-0 top-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar textos
            </button>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              Agenda
            </p>
            <h2 className="mt-2 text-3xl font-black text-na-heketDark sm:text-4xl">
              {edit.filosofiaPage.sesionesTitle ?? "Próximas sesiones"}
            </h2>
            <p className="mt-3 max-w-2xl text-na-muted">
              {edit.filosofiaPage.sesionesIntro ??
                "Clic en una tarjeta para editar. Luego Guardar borrador."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              edit.addAgendaEntry("diplomado");
              edit.setActiveSection("sesiones");
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir sesión
          </button>
          <AgendaCardGrid
            items={diplomadoItems}
            list={edit.diplomadoAgenda}
            onEdit={(id) => {
              edit.setSelectedAgendaId(id);
              edit.setActiveSection("sesiones");
            }}
          />
        </div>
      </section>

      <section
        id="otras-actividades"
        className="scroll-mt-24 border-t border-na-heket/10 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Home
          </p>
          <h2 className="mt-2 text-2xl font-black text-na-heketDark">
            Otras actividades (carrusel del inicio)
          </h2>
          <p className="mt-2 text-sm text-na-muted">
            Conferencias, cursos y talleres — no son sesiones del diplomado.
          </p>
          <button
            type="button"
            onClick={() => {
              edit.addAgendaEntry("conferencia");
              edit.setActiveSection("otras");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-amber-400 px-4 py-2 text-xs font-bold uppercase text-amber-900"
          >
            <Plus className="h-4 w-4" />
            Añadir actividad
          </button>
          <AgendaCardGrid
            items={otrasItems}
            list={edit.otrasAgenda}
            onEdit={(id) => {
              edit.setSelectedAgendaId(id);
              edit.setActiveSection("otras");
            }}
          />
        </div>
      </section>
    </>
  );
}

export function FilosofiaAgendaPublic() {
  const cms = useCmsDocument();
  const sessions = useCmsFilosofiaPageAgenda();
  const fp = cms?.sections.filosofiaPage;

  const items = sessions.map((e) => ({
    ...e,
    image: resolveCmsMediaUrl(e.image),
  }));

  return (
    <UpcomingAgenda
      title={
        isCmsEnabled() && fp?.sesionesTitle
          ? fp.sesionesTitle
          : "Próximas sesiones"
      }
      intro={
        isCmsEnabled() && fp?.sesionesIntro
          ? fp.sesionesIntro
          : "Algunas de nuestras próximas clases, charlas y encuentros en las distintas sedes. Haz clic en una sesión para ver más detalles."
      }
      items={items}
      tinted
      whatsappCategory="diplomado"
      defaultInscribeMessage={DEFAULT_INSCRIBE}
    />
  );
}

export function FilosofiaProximasSesionesBody() {
  const edit = useFilosofiaCmsEdit();
  if (edit) return <FilosofiaAgendaEditZones />;
  return <FilosofiaAgendaPublic />;
}