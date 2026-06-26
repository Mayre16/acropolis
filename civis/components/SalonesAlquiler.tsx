"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, MapPin, Pencil, UsersRound } from "lucide-react";
import {
  LAYOUT_LABELS,
  type LayoutKind,
  type Salon,
} from "@/lib/salones";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  useCivisSalonesPage,
  useMergedSalonesBySede,
} from "@/lib/cms/salones-hooks";
import { useSalonesCmsEdit } from "@/components/cms/SalonesCmsEditContext";
import { CIVIS_FORM_HREF } from "@/lib/civis-content";
import { WHATSAPP_URL } from "@/lib/site-config";

type SalonesAlquilerProps = {
  id?: string;
  variant?: "principal" | "civis";
  embedded?: boolean;
};

const VARIANT = {
  principal: {
    section: "border-t border-na-heket/10 bg-na-heket/[0.04]",
    eyebrow: "text-na-kefer",
    title: "text-na-heketDark",
    card: "border-na-heket/12 bg-na-surface shadow-na-soft",
    badge: "bg-na-heket/10 text-na-heketDark",
    icon: "text-na-kefer",
    cta: "bg-na-heket text-white shadow-na-heket/25 hover:bg-na-kefer",
    sede: "text-na-kefer",
  },
  civis: {
    section: "border-t border-na-civis/10 bg-na-civis/[0.04]",
    eyebrow: "text-na-civisDark",
    title: "text-na-ink",
    card: "border-na-civis/15 bg-na-surface shadow-na-soft",
    badge: "bg-na-civis/10 text-na-civisDark",
    icon: "text-na-civis",
    cta: "bg-na-civis text-white shadow-na-civis/25 hover:bg-na-civisDark",
    sede: "text-na-civisDark",
  },
} as const;

function CapacityRow({
  layout,
  count,
  featured,
  iconClass,
  badgeClass,
}: {
  layout: LayoutKind;
  count: number;
  featured: boolean;
  iconClass: string;
  badgeClass: string;
}) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm ${
        featured ? "bg-black/[0.04] font-semibold" : ""
      }`}
    >
      <span className="text-na-muted">{LAYOUT_LABELS[layout]}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}
      >
        <UsersRound className={`h-3.5 w-3.5 ${iconClass}`} />
        {count} pers.
        {featured ? <span className="sr-only"> (vista en foto)</span> : null}
      </span>
    </li>
  );
}

function SalonCard({
  salon,
  styles,
  onEdit,
}: {
  salon: Salon;
  styles: (typeof VARIANT)[keyof typeof VARIANT];
  onEdit?: () => void;
}) {
  const { capacities, featuredLayout } = salon;
  const imageSrc = resolveCmsMediaUrl(salon.image.src) ?? salon.image.src;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border ${styles.card}`}
    >
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow"
          aria-label={`Editar ${salon.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}
      <div className="relative aspect-[16/10] w-full bg-black/5">
        <Image
          src={imageSrc}
          alt={salon.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
          unoptimized
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur ${styles.badge}`}
        >
          <LayoutGrid className="h-3 w-3" aria-hidden />
          {LAYOUT_LABELS[featuredLayout]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h4 className="text-lg font-black text-na-ink">{salon.name}</h4>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
          {salon.summary}
        </p>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-na-muted">
          Capacidad máxima por disposición
        </p>
        <ul className="mt-2 space-y-1">
          {(["butacas", "mesas", "herradura"] as LayoutKind[]).map((layout) => (
            <CapacityRow
              key={layout}
              layout={layout}
              count={capacities[layout]}
              featured={layout === featuredLayout}
              iconClass={styles.icon}
              badgeClass={styles.badge}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}

export function SalonesAlquiler({
  id = "salones",
  variant = "civis",
  embedded = false,
}: SalonesAlquilerProps) {
  const styles = VARIANT[variant];
  const edit = useSalonesCmsEdit();
  const groups = useMergedSalonesBySede();
  const pageCopy = useCivisSalonesPage();
  const whatsapp = `${WHATSAPP_URL}?text=${encodeURIComponent(
    "Hola, me interesa alquilar un salón de Nueva Acrópolis para un taller o curso. ¿Me pueden dar disponibilidad y tarifas?",
  )}`;

  const inner = (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {!embedded ? (
        <div className="relative">
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.setSelectedId("__section__")}
              className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar textos
            </button>
          ) : null}
          <p className={`text-xs font-bold uppercase tracking-[0.32em] ${styles.eyebrow}`}>
            {pageCopy.eyebrow}
          </p>
          <h2 className={`mt-3 text-balance text-3xl font-black sm:text-4xl ${styles.title}`}>
            {pageCopy.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-na-muted sm:text-base">
            {pageCopy.lede}
          </p>
        </div>
      ) : (
        <div className="relative">
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.setSelectedId("__section__")}
              className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar textos
            </button>
          ) : null}
          <h3 className={`text-2xl font-black sm:text-3xl ${styles.title}`}>
            {pageCopy.catalogTitle}
          </h3>
          <p className="mt-3 max-w-3xl text-sm text-na-muted sm:text-base">
            {pageCopy.catalogIntro}
          </p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.sede} className={embedded ? "mt-10" : "mt-12"}>
          <div className={`flex items-center gap-2 ${styles.sede}`}>
            <MapPin className="h-4 w-4" aria-hidden />
            <h3 className="text-lg font-black">Sede {group.sede}</h3>
          </div>
          <ul
            className={`mt-6 grid gap-7 ${
              group.salones.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {group.salones.map((salon) => (
              <li key={salon.id}>
                <SalonCard
                  salon={salon}
                  styles={styles}
                  onEdit={
                    edit?.ready
                      ? () => edit.setSelectedId(salon.id)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-10 text-center">
        {variant === "civis" ? (
          <Link
            href={CIVIS_FORM_HREF}
            className={`inline-flex rounded-full px-6 py-3 text-sm font-bold shadow-md transition ${styles.cta}`}
          >
            Solicitar propuesta con salón
          </Link>
        ) : (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex rounded-full px-6 py-3 text-sm font-bold shadow-md transition ${styles.cta}`}
          >
            Consultar disponibilidad y tarifas
          </a>
        )}
      </p>
    </div>
  );

  if (embedded) {
    return (
      <div
        id={id}
        className={`py-14 sm:py-16 ${variant === "civis" ? "scroll-mt-28 border-b border-na-civis/10 bg-na-surface" : ""}`}
      >
        {inner}
      </div>
    );
  }

  return (
    <section
      id={id}
      className={`scroll-mt-28 py-14 sm:py-16 ${styles.section}`}
    >
      {inner}
    </section>
  );
}
