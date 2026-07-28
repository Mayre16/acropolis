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
import { getMapPinsFromVenues, cmsToVenue, venuesContactWhatsAppHref } from "@/lib/cms/venues-edit";
import { useVenuesCmsEdit } from "@/components/cms/VenuesCmsEditContext";
import { VenueNameLockup } from "@/components/VenueNameLockup";
import { DrMapSvg } from "@/components/DrMapSvg";

function DrMapPin({
  x,
  y,
  label,
  variant = "sede",
  hideLabel = false,
}: {
  x: number;
  y: number;
  label: string;
  variant?: "sede" | "centro";
  hideLabel?: boolean;
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
      {!hideLabel ? (
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
      ) : null}
    </g>
  );
}

function MapPanel({ venues }: { venues: VenueLocation[] }) {
  const pins = getMapPinsFromVenues(venues);
  const hasCentroPins = pins.some((p) => p.variant === "centro");

  return (
    <div className="relative mx-auto max-w-3xl rounded-2xl border border-na-heket/10 bg-na-surface p-4 shadow-na-soft sm:p-6">
      <DrMapSvg ariaLabel="Mapa de República Dominicana con sedes de Nueva Acrópolis por ciudad">
        {pins.map((pin) => (
          <DrMapPin
            key={pin.id}
            x={pin.x}
            y={pin.y}
            label={pin.label}
            variant={pin.variant}
            hideLabel={pin.hideLabel}
          />
        ))}
      </DrMapSvg>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-na-muted">
        <li className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-na-amon ring-2 ring-na-amon/30" />
          Sedes
        </li>
        {hasCentroPins ? (
          <li className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-na-kefer ring-2 ring-na-kefer/30" />
            Puntos culturales
          </li>
        ) : null}
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
          href={venuesContactWhatsAppHref(contact, whatsapp.diplomado)}
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

  const editing = !!edit;
  const onEditVenue = edit
    ? (id: string) => edit.setSelectedId(id)
    : undefined;

  const onAdd = edit ? (kind: VenueKind) => edit.addItem(kind) : undefined;

  const onEditContact = edit ? edit.openContactPanel : undefined;

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
