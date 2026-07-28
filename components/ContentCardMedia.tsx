"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { ReactNode } from "react";

/** Miniatura lateral estándar en tarjetas de agenda (sesiones, cursos, talleres, voluntariado). */
export function AgendaCardThumbnail({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[4.5rem] w-24 shrink-0 overflow-hidden rounded-xl bg-na-heket/5 sm:h-28 sm:w-28 ${className}`}
      aria-hidden={!src}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="112px"
          className="object-cover"
        />
      ) : null}
    </div>
  );
}

function AgendaCardMetaRow({
  icon: Icon,
  iconClass,
  value,
}: {
  icon: LucideIcon;
  iconClass: string;
  value?: string;
}) {
  const text = value?.trim() ?? "";
  return (
    <p className="flex min-h-5 items-center gap-1.5">
      <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} aria-hidden />
      <span className={text ? "truncate" : "invisible select-none"} aria-hidden={!text}>
        {text || "\u00a0"}
      </span>
    </p>
  );
}

/** Texto de tarjeta de agenda con alturas fijas para alinear filas del grid. */
export function AgendaCardBody({
  tag,
  title,
  date = "",
  time = "",
  sede = "",
  iconClass,
  iconWrapClass = "",
  titleClassName = "text-base font-bold text-na-heketDark",
  footer,
  className = "",
}: {
  tag?: string;
  title: string;
  date?: string;
  time?: string;
  sede?: string;
  iconClass: string;
  iconWrapClass?: string;
  titleClassName?: string;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col ${className}`}>
      <div className="min-h-[1.375rem]">
        {tag ? (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${iconWrapClass} ${iconClass}`}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <p className={`mt-1 min-h-[2.75rem] leading-snug ${titleClassName}`}>
        {title}
      </p>
      <div className="mt-2 space-y-1 text-sm text-na-muted">
        <AgendaCardMetaRow icon={CalendarDays} iconClass={iconClass} value={date} />
        <AgendaCardMetaRow icon={Clock} iconClass={iconClass} value={time} />
        <AgendaCardMetaRow icon={MapPin} iconClass={iconClass} value={sede} />
      </div>
      <div className="mt-auto min-h-[1.25rem] pt-2">{footer}</div>
    </div>
  );
}

/** Imagen superior estándar en tarjetas de listado (artículos, eventos, viajes). */
export function ContentCardImage({
  src,
  alt,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  imageClassName = "object-cover",
  priority = false,
  children,
}: {
  src?: string;
  alt: string;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden bg-na-heket/5 ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          sizes={sizes}
          priority={priority}
          unoptimized
        />
      ) : null}
      {children}
    </div>
  );
}
