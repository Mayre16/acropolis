"use client";

import Link from "next/link";
import { MapPin, Pencil, Plus } from "lucide-react";
import { useMergedVenues } from "@/lib/cms/hooks";
import { mapsUrl } from "@/lib/locations";
import { useVenuesCmsEdit } from "@/components/cms/VenuesCmsEditContext";
import { VenueNameLockup } from "@/components/VenueNameLockup";

export function VenuesTeaser() {
  const venues = useMergedVenues();
  const edit = useVenuesCmsEdit();
  const sedes = venues.filter((v) => v.kind === "sede").slice(0, 2);
  const centros = venues.filter((v) => v.kind === "centro-cultural").slice(0, 2);

  return (
    <section className="border-t border-na-heket/10 bg-na-sand/30 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              Dónde estamos
            </p>
            <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
              Sedes y puntos culturales
            </h2>
          </div>
          <Link
            href="/donde-estamos"
            className="text-sm font-bold text-na-kefer hover:underline"
          >
            Ver todas las direcciones →
          </Link>
        </div>

        {edit ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => edit.addItem("sede")}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir sede
            </button>
            <button
              type="button"
              onClick={() => edit.addItem("centro-cultural")}
              className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 px-4 py-2 text-xs font-bold uppercase text-na-heket"
            >
              <Plus className="h-4 w-4" />
              Añadir punto cultural
            </button>
          </div>
        ) : null}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...sedes, ...centros].map((v) => (
            <li
              key={v.id}
              className="relative rounded-2xl border border-na-heket/10 bg-na-surface p-4 shadow-na-soft"
            >
              {edit ? (
                <button
                  type="button"
                  onClick={() => edit.setSelectedId(v.id)}
                  className="absolute right-3 top-3 rounded-full bg-na-helios p-1.5 text-na-ink shadow"
                  aria-label={`Editar ${v.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
              ) : null}
              <VenueNameLockup name={v.name} kind={v.kind} size="teaser" />
              <p className="mt-1 flex items-start gap-1.5 text-sm text-na-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  {v.address}
                  <span className="block text-xs">{v.zone}, {v.city}</span>
                </span>
              </p>
              <a
                href={mapsUrl(v.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-bold text-na-kefer hover:underline"
              >
                Cómo llegar
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
