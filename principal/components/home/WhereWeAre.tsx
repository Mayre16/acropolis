"use client";

import {
  Building2,
  ExternalLink,
  Landmark,
  Mail,
  MapPin as MapPinIcon,
  Pencil,
  Phone,
  Plus,
} from "lucide-react";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import {
  mapsUrl,
  type VenueLocation,
  type VenueKind,
} from "@/lib/locations";
import { useMergedVenues, useMergedVenuesContact } from "@/lib/cms/hooks";
import type { CmsVenuesContact } from "@/lib/cms/types";
import { getMapPinsFromVenues, cmsToVenue } from "@/lib/cms/venues-edit";
import { useVenuesCmsEdit } from "@/components/cms/VenuesCmsEditContext";
import { VenueNameLockup } from "@/components/VenueNameLockup";

/** Trazado de República Dominicana (Simplemaps, libre uso comercial · proyección Mercator). */
const DR_PATH =
  "M107.8 90.9l4.7 1.1 4.5 2.3-1-5.2-4.4-10.2 0.3-2.5 0-2-6.6-0.4-0.9-2.8 2.7-4.1 3.9-4.3 1.1-0.8 1.3-0.2 2.7 0 1.7-0.7 2.7-3.3 1.5-1.3 3-1.2 2.1-0.6 2.2-1 2.8-2.6-1.6-3.3-0.3-2.9 1.3-2.1 3.2-0.8 1.9 0.3 2.9 1.3 1.9 0.3 0.8-0.6 1.8-2.4 0.9-0.6 25.3-1.9 6.5 0.9 6.3 2.3 23.6 12.3 6.9 1.4 6.6-2.6 5 3.7 3.5 1.6 11 0.4 2.9-0.8 0.6-2 0.2-2.7 1.3-2.7 2.9-1.1 2.1 2.4 2.7 6.9 1.9-1.2 1.5-1.3 1-1.4 0.7-1.8-2.1-0.6-0.5-0.4 0-0.6-0.8-1.8 3.9 1.5 3.2-0.2 3.3-0.8 4-0.5 2.5-2 4.6-8.6 3-2 3.8-0.9 8-4 4.3-0.6 4 1 3.8 2.3 2.1 3.3-1.3 4.2 4.8 1.9 1.8 0-1.2-4-0.6-1.5 11.9 1.9 3.5-0.3 7.3-1.8 2.8 0.2 3.1 2 10.8 13.1 0.9 2.5-1.3 2.4 9.3 0.1 3.6 1.7 9.4 8 9 4.6 9.5 3.3 11 1.7 14.9 0.1 1.2-0.7 1.3-1.8 3-2.1 3.4-1.7 2.4-0.8 9.7 3.1 15 16 9.1 9.6 4.1 2.9 4.5 2.3 5 1.5 11.3 1.2 9.1 3.3 16.5 3.3 3.7-0.1 2.5-0.9 2.2-1.9 9-9.7 4.7-2.2 13.7 0.3 6.7-0.7 3 0.4 3.8 2.2 8.4 9 2.6 6.1-0.1 6.6-4 14.4 4.9 2.1 1.9 4.7-0.1 11.9 0.6 5.2 1.6 4.2 16.4 24.7 7.4 7.2 1 0.9 8.4 3.5 5-0.8 9.6-3.7 4.9-0.9 11.2-0.4 4.9-1.1 5-2 7.3-4.9 2.9-0.7 2.5 0.6 5.2 2.6 3.3 0.6 6-1.5 2.6-0.3 1.4 0 1.3 0.4 1 0.8 0.4 1.5 0.8 1.2 1.7-0.4 2.7-1.7 14.3 5.8 4.3 3.1 2.8-5.7 4.5-4.2 11.2-6.2 7.2-2.2 1.7 3-1.9 6.3-3.6 7.4 4.9 1.8 5.6 0 5.4-1.4 4.5-2.4 1.4 5.8-3.2 4.5-4.4 4.1-2.3 4.5-1 4.7-2.9 4.3-4.3 3.1-5.4 1.3-19.4-3.5-21.2 1.6-5-1.4-9.2-4.6-31.5-3.9-3.5 0.9-1.4 3.5-0.8 12.5-1.8 10.6 0.8 4 2.3 1.7 3.1 2.2 13.6-2.1 4.7 1.7 5.9-1.9 11.6 4.6 6.1-0.7-1.5-1.3-2-1.2-2.3-0.9-2.8-0.3 0-1.8 13.2-0.7 3.9 0.7 4.3 3.2 3.4 8 4.2 3.2 4.2 1.1 8.5 1.1 23 6.2 9.5 2.6 3.9-0.3 4.6-2.6-1.5-1.9-3.1-1.9 0-2.5 4.4-1.3 3.8 3.5 5.2 8.5 3.4 2 3.7 1.1 3.2 1.4 1.7 2.8 3-2.4 6-2.8 2.8-2.1-1.9-2.1 0.9-0.5 2.3-0.1 2.1-0.7 2.6-2.7 0.7-1.1 1-0.1 8.9 0.5 5.1 1.1 4.7 1.6 4.1 2.3 0.5 0.7 0 1 0.2 1 1 0.9 5 1.8 0.5-0.1 8.8 1.8 5.5 0.3 2.3 0.8 0.4 0.3 2 1.4 2.3 1.3 4.4 0.3 2.5 1 28.7 26.8 10.6 12.8 14.9 11.4 10.6 7.5 3.1 1.4 1.6 1 11.1 10.8 14.1 8.6 6.8 10.4-1.3 10.3-23.2 35.4-1.7 1.4-1.6 1.8-0.7 2.5 0.4 9-0.4 2.6-2.8 4.4-4.1 2.1-5.1 0.6-5.9 0-4.5-1.5-9.8-6.5-3.5-1.1-4.1 2.8 0.6 4.2 1.3 4.9-2.1 5.1-3 4.1-1.9 4.7-3.8 15.1-1.4 2.7-2.8 1-20.9 1.7-4.2-1.5-0.6-9.6-6-12.5-8.2-12.3-7.3-8.4-7.8-5.4-10.2-4.4-10.4-1.4-11.9 4.9-18 0.8-4.6-0.8-10.9-3.7-4.9-0.8-4.2-1.4-7.2-6.1-5.4-1.4-4.8 1-4.8 1.6-4.9 0.4-5-3-5.1 4.8-32.1 2.5-9.6 3.5-5.1 0.1-13.5-9.3-5.5-3-3.6-0.4-1.5 2.4 0.1 3 0.4 2.9-0.7 2.4-2.2 0.7-3.4 0-3.2-0.6-1.4-0.9-4.2-7.1-1.9-1.9-1.9-0.6-38-4.2-6.9 0.3-1.1 0-4 1.2-7.7 3.8-6.4 4.4-2.4 1.1-6.6 2.2-2.6 1.3-3.1 1.6-5.5 4.9-4.2 6.6-1.6 7.8-1.3 2.1-5.7 3-1.3 1.9-1 2.9-8.3 7.7-6 7-3.4 2.9-1.5-0.7-6 0.1-4.6 0.8-3.1 1.7-4.3-2.7-4.7-0.9-31.6 0.1-5.3 1.7-10.2 5.7-5.7 1.3-17.1 0-4-1.6-0.3-2.3 1.7-1.7 2.4-1.5 1.1-1.6-0.7-2.8-1.7-1.6-1.7-1-1.9-2.5-4.7-3.1-1.1-2.4 0.6-2.6 1.5-1.2 1.6-0.9 1.3-1.8 1.2-5.2 0.1-5.5-0.6-4.8-1.4-3.1-5.4-6.8-3.3-2.4-5.7-2.2-4.9-1.2-6.2-0.4-5.2 1.4-2.3 4.5 0.9 5.5-0.6 2.2-7.4 7.2-2 1.3-2.7 0.8-2.8-0.1-5.2-1.6-2.2-0.2-2 0.7-3.4 2.5-2.3 0.5-3.1-0.4-1.1 0.7-2.5 2.3-0.7 0.9-1.5 3.3-0.3 1.1-0.7 1-3.3 1.1-1.2 0.6-6.6 7.9-3.5 2.1-5.8 0.7-2.4-0.9-1.6-2.1-1.3-2.6-1.6-2.3-2.5-2-2.7-1.1-10.7-2.3-4.9-0.1-3.9 1.5-1.5 4-0.6 2.2-2.2 3.8-0.5 2.9 0.5 3.3 1.2 1.8 1.6 1.7 1.8 2.9 4 14.1 1.3 2.4 0 3.1-4.8 7.3-4.1 10.5-23.3 34.2-2.1 5.9-1 2.1-2.3 1.6-5 2.6-3 2.6-2.2 2.5-1.7 3.1-1.5 4.3-1.8-0.6-0.7-0.4-1-0.9-0.4 1.9-0.4 0.7-0.9 0.8 1.7 0-1 2.2-1.3 1.6-1.6 1.1-1.9 0.4-0.9 1.1-1.7 5.1-0.9 1.9-3 4.4-8.3 24.3-2.6 4.8-10.2 14.3-2.5-1.1-2.1-2.1-0.1-1-2.4-2.1-17-28.1-4.1-4.5-8.4-3.3-19.7 2.7-8.4-2.1 2.4-1.8 7.8-8.2 1.7-3.3-0.3-5.6-1.1-3.9-3.8-7.4-2.7-4.1-0.5-1.5-0.1-3.1 1.6-9.9-1.8-4.5-4.3-5-9-7.5-13.9-5.3 3-7.8 0.9-4.5-0.6-7.6 0.2-4.3-0.6-2.9-2.6-7.4-0.4-2.5 0.7-5.1 1.9-4.9 11-18.9 0.2-0.3 2.9-5-0.6-0.7-2.2-2.1-3.6-2.3-13.2-5-9.4-6.3-2-2.3-3.7-5.5-2.1-1.9-9.6-2.4-3.7-2.1-1.5-4.8 0.9-2.8 1.9-1.1 1.3-1.4-0.6-3.9-1.6-2.5-22.4-23-2.1-4.2 4.2-3.2 9.2-2 18.5 3.4 9.6-3.2 3.2-3.5 5.1-8.7 3.4-3.8 0.6-0.4 1.7-1 6.6-4.1 3.5-2.9 2.9-4.9 1.7-4.4 1.2-4.8 0.4-4.9-2-10.2-0.2-10.6-1.4-4.8-1.8-2.4-5.7-5.2-2.2-2.7-3.5-7.3-2.3-1.9-5.8-0.2-6.1 2.1-4.4 0.7-0.8-4.5 4.3-2.9 12.7-3.4 3.2-2 10.7-11.9 7.4-10.4 3.7-3.4 8.4-6 3.1-4.6 1.3-4.5 1.1-15.6-3.1-1.6-16-7.8-8.2-8.3-1-1.1-4.4-6.2-1.2-5.2 1.6-1.7 6.7-3.8 2.3-1.8 3.1-8 1.4-1.5 2.8-6 0.2-11.7-3-20.5-6.9-16.4-1.1-6 0.4-6.8 0.2-4.2-0.8-4.6-2.2-7.3z m57.5 564.2l-4.1-2.4-0.1-5.6 2.3-6.5 2.8-5.1 3.4 1.9 3.6 2.6 6.3 6.1-3.8 1.2-6.2 6.3-4.2 1.5z m706.4-161.9l12.8-0.4 3.3 1.2 2.5 3.4 2.8 5.1 1.8 4.7-0.4 2-3.8-0.8-7.9-3.7-4.2-0.8-4.4 0.5-7.6 2.5-4.2 0.5-8.7-2.3-6.2-5.6-4-7-2.1-6.4 3.6-1.1 4.4 0.9 4.2 2.1 3.7 2.6 2.9 1.1 11.5 1.5z";

function DrMapPin({
  x,
  y,
  label,
  variant = "sede",
}: {
  x: number;
  y: number;
  label: string;
  variant?: "sede" | "centro";
}) {
  const fill = variant === "centro" ? "#009485" : "#f39300";

  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="10" fill={fill} opacity="0.35">
        <animate
          attributeName="r"
          values="10;26;10"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.45;0;0.45"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle r="11" fill={fill} stroke="#ffffff" strokeWidth="3" />
      <circle r="4" fill="#ffffff" />
      <text
        x="0"
        y="-22"
        textAnchor="middle"
        className="fill-na-heketDark"
        style={{ fontSize: 26, fontWeight: 800, paintOrder: "stroke" }}
        stroke="#ffffff"
        strokeWidth="5"
      >
        {label}
      </text>
    </g>
  );
}

function MapPanel({ venues }: { venues: VenueLocation[] }) {
  const pins = getMapPinsFromVenues(venues);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-na-heket/10 bg-na-surface p-4 shadow-na-soft sm:p-6">
      <svg
        viewBox="0 0 1000 686"
        role="img"
        aria-label="Mapa de República Dominicana con presencia de Nueva Acrópolis por ciudad"
        className="h-auto w-full"
      >
        <defs>
          <linearGradient id="drFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a7264" />
            <stop offset="100%" stopColor="#009485" />
          </linearGradient>
        </defs>
        <path
          d={DR_PATH}
          fill="url(#drFill)"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {pins.map((pin) => (
          <DrMapPin
            key={pin.city}
            x={pin.x}
            y={pin.y}
            label={pin.city}
            variant={pin.variant}
          />
        ))}
      </svg>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-na-muted">
        <li className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-na-amon ring-2 ring-na-amon/30" />
          Sedes
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-na-kefer ring-2 ring-na-kefer/30" />
          Puntos culturales
        </li>
      </ul>
    </div>
  );
}

function VenueCard({
  venue,
  onEdit,
}: {
  venue: VenueLocation;
  onEdit?: () => void;
}) {
  const mapsReady = !venue.address.toLowerCase().includes("próximamente");

  return (
    <li className="relative rounded-2xl border border-na-heket/10 bg-na-surface p-5 shadow-na-soft sm:p-6">
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-4 top-4 rounded-full bg-na-helios p-2 text-na-ink shadow"
          aria-label={`Editar ${venue.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <VenueNameLockup name={venue.name} kind={venue.kind} size="card" />
          <p className="mt-0.5 text-sm font-semibold text-na-muted">
            {venue.zone} · {venue.city}
          </p>
        </div>
        {mapsReady ? (
          <a
            href={mapsUrl(venue.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-na-heket/20 px-3.5 py-2 text-xs font-bold text-na-heket transition hover:bg-na-heket/10"
          >
            Cómo llegar
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2.5 text-sm text-na-muted">
        <li className="flex gap-2">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-na-heket" aria-hidden />
          <span>
            <span className="font-semibold text-na-ink">{venue.address}</span>
            {venue.reference ? (
              <span className="mt-0.5 block text-na-muted">{venue.reference}</span>
            ) : null}
          </span>
        </li>
        {venue.phone ? (
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-na-heket" aria-hidden />
            <a href={`tel:${venue.phone.replace(/\D/g, "")}`} className="hover:text-na-heket">
              {venue.phone}
            </a>
          </li>
        ) : null}
      </ul>
    </li>
  );
}

function VenueGroup({
  title,
  icon: Icon,
  venues,
  dotClassName,
  onEditVenue,
}: {
  title: string;
  icon: typeof Building2;
  venues: VenueLocation[];
  dotClassName: string;
  onEditVenue?: (id: string) => void;
}) {
  if (venues.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${dotClassName}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        </span>
        <h3 className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {title}
        </h3>
      </div>
      <ul className="mt-4 grid gap-4 lg:grid-cols-2">
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onEdit={onEditVenue ? () => onEditVenue(venue.id) : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

function EncuentranosPanel({
  venues,
  contact,
  onEditVenue,
  onAdd,
  onEditContact,
}: {
  venues: VenueLocation[];
  contact: CmsVenuesContact;
  onEditVenue?: (id: string) => void;
  onAdd?: (kind: VenueKind) => void;
  onEditContact?: () => void;
}) {
  const whatsapp = useWhatsAppUrls();
  const sedes = venues.filter((v) => v.kind === "sede");
  const centros = venues.filter((v) => v.kind === "centro-cultural");

  return (
    <div className="space-y-10">
      {onAdd ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => onAdd("sede")}
            className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir sede
          </button>
          <button
            type="button"
            onClick={() => onAdd("centro-cultural")}
            className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 px-4 py-2 text-xs font-bold uppercase text-na-heket"
          >
            <Plus className="h-4 w-4" />
            Añadir punto cultural
          </button>
        </div>
      ) : null}
      <VenueGroup
        title="Sedes"
        icon={Building2}
        venues={sedes}
        dotClassName="bg-na-amon/15 text-na-amon"
        onEditVenue={onEditVenue}
      />
      <VenueGroup
        title="Puntos culturales"
        icon={Landmark}
        venues={centros}
        dotClassName="bg-na-kefer/10 text-na-kefer"
        onEditVenue={onEditVenue}
      />

      <div className="relative rounded-2xl border border-na-heket/10 bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-6 text-white shadow-na-card sm:p-8">
        {onEditContact ? (
          <button
            type="button"
            onClick={onEditContact}
            className="absolute right-4 top-4 rounded-full bg-na-helios p-2 text-na-ink shadow"
            aria-label="Editar bloque de contacto"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <h3 className="text-lg font-black">{contact.title}</h3>
        <p className="mt-2 max-w-2xl text-sm text-white/85">{contact.body}</p>
        <ul className="mt-4 space-y-2 text-sm text-white/90">
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-na-helios" aria-hidden />
            {contact.phone}
          </li>
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-na-helios" aria-hidden />
            {contact.email}
          </li>
        </ul>
        <a
          href={whatsapp.diplomado}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-na-helios px-6 py-3 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/25 transition hover:brightness-105"
        >
          {contact.ctaLabel}
        </a>
      </div>
    </div>
  );
}

export function WhereWeAre() {
  const merged = useMergedVenues();
  const mergedContact = useMergedVenuesContact();
  const edit = useVenuesCmsEdit();

  const venues: VenueLocation[] = edit?.ready
    ? edit.items.map(cmsToVenue)
    : merged;

  const contact = edit?.ready ? edit.contact : mergedContact;

  const onEditVenue = edit?.ready
    ? (id: string) => edit.setSelectedId(id)
    : undefined;

  const onAdd = edit?.ready
    ? (kind: VenueKind) => edit.addItem(kind)
    : undefined;

  const onEditContact = edit?.ready ? edit.openContactPanel : undefined;

  return (
    <section
      id="donde-estamos"
      className="scroll-mt-28 border-t border-na-heket/10 bg-na-sand/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Dónde estamos
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-balance text-center text-3xl font-black text-na-heketDark sm:text-4xl">
          Sedes y puntos culturales en República Dominicana
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-na-muted">
          Consulta el mapa y, al continuar, direcciones, teléfonos y cómo llegar
          a cada espacio.
        </p>

        <div className="mt-10">
          <MapPanel venues={venues} />
        </div>

        <div
          id="encuentranos"
          className="scroll-mt-28 mt-16 border-t border-na-heket/10 pt-14 sm:mt-20 sm:pt-16"
        >
          <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Encuéntranos
          </p>
          <h3 className="mx-auto mt-3 max-w-2xl text-balance text-center text-2xl font-black text-na-heketDark sm:text-3xl">
            Direcciones y contacto
          </h3>
          <div className="mt-10">
            <EncuentranosPanel
              venues={venues}
              contact={contact}
              onEditVenue={onEditVenue}
              onAdd={onAdd}
              onEditContact={onEditContact}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
