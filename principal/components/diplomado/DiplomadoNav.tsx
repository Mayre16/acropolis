"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { DIPLOMADO_INSCRIBE_WHATSAPP } from "@/lib/diplomado-content";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import {
  DIPLOMADO_PATH,
  INFO_EMAIL,
  NAV_CONTENIDO,
  NAV_INSTITUCIONAL,
  NAV_LINKS,
  type NavInstitucionalItem,
  type NavLink,
} from "@/lib/site-config";

const CONTACT_HREF = `mailto:${INFO_EMAIL}?subject=${encodeURIComponent("Consulta — Diplomado Nueva Acrópolis")}`;

function DiplomadoInstitucionalNav({ onNavigate }: { onNavigate: () => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const toggle = (label: string) =>
    setOpenGroup((prev) => (prev === label ? null : label));
  const subClass =
    "block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10";

  return (
    <div className="flex flex-col gap-0.5">
      {NAV_INSTITUCIONAL.items.map((item: NavInstitucionalItem) =>
        item.type === "group" ? (
          <div key={item.label}>
            <div className="flex items-stretch">
              <Link
                href={item.href}
                className="min-w-0 flex-1 rounded-l-lg px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10"
                onClick={onNavigate}
              >
                {item.label}
              </Link>
              <button
                type="button"
                className="flex shrink-0 items-center rounded-r-lg px-3 text-white/60 hover:bg-white/10"
                aria-expanded={openGroup === item.label}
                aria-label={`${openGroup === item.label ? "Ocultar" : "Mostrar"} opciones de ${item.label}`}
                onClick={() => toggle(item.label)}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${openGroup === item.label ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            {openGroup === item.label ? (
              <div className="ml-2 flex flex-col gap-0.5 border-l border-white/15 pl-3">
                {item.items.map((sub) => (
                  <Link key={sub.href} href={sub.href} className={subClass} onClick={onNavigate}>
                    {sub.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ),
      )}
    </div>
  );
}

function NavItemLink({
  item,
  onNavigate,
}: {
  item: NavLink;
  onNavigate: () => void;
}) {
  const className =
    "block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10";

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function DiplomadoNav() {
  const [open, setOpen] = useState(false);
  const whatsapp = useWhatsAppUrls();
  const inscribeHref = `${whatsapp.diplomado}?text=${encodeURIComponent(DIPLOMADO_INSCRIBE_WHATSAPP)}`;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="diplomado-nav pointer-events-none absolute top-0 right-0 z-50">
        <button
          type="button"
          className="diplomado-nav__menu-btn pointer-events-auto inline-flex h-11 w-11 items-center justify-center text-white"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-7 w-7" strokeWidth={2} /> : <Menu className="h-7 w-7" strokeWidth={2} />}
        </button>
      </header>

      {open ? (
        <div
          className="diplomado-nav__backdrop fixed inset-0 z-[60] bg-black/50"
          aria-hidden
          onClick={close}
        />
      ) : null}

      <div
        className={`diplomado-nav__panel fixed right-0 top-0 z-[70] flex h-full w-[min(100%,20rem)] flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--dip-gold)]">
            Menú
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white"
            aria-label="Cerrar menú"
            onClick={close}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación del sitio">
          <Link
            href="/"
            className="mb-1 block rounded-lg px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            onClick={close}
          >
            Inicio
          </Link>

          <p className="mt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            {NAV_INSTITUCIONAL.label}
          </p>
          <DiplomadoInstitucionalNav onNavigate={close} />

          <p className="mt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Sitio
          </p>
          {NAV_LINKS.flatMap((item) => {
            const link = (
              <NavItemLink key={item.href} item={item} onNavigate={close} />
            );
            if (item.href === "/voluntariado") {
              return [
                link,
                <Link
                  key="nav-contenido"
                  href={NAV_CONTENIDO.hubHref}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10"
                  onClick={close}
                >
                  {NAV_CONTENIDO.label}
                </Link>,
              ];
            }
            return [link];
          })}

          <p className="mt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Diplomado
          </p>
          <Link
            href={DIPLOMADO_PATH}
            className="block rounded-lg bg-white/10 px-3 py-2.5 text-sm font-bold text-[var(--dip-gold)]"
            onClick={close}
          >
            Esta página
          </Link>
          <a
            href="#inscripcion"
            className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10"
            onClick={close}
          >
            Inscripción
          </a>
          <a
            href={inscribeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-full bg-[var(--dip-gold)] px-4 py-3 text-center text-sm font-bold text-[#1a1a18]"
            onClick={close}
          >
            Quiero inscribirme
          </a>
          <a
            href={CONTACT_HREF}
            className="mt-2 block rounded-full border border-white/25 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            onClick={close}
          >
            Contáctanos
          </a>
        </nav>
      </div>
    </>
  );
}
