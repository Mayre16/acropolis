"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NAV_LINKS,
  NAV_INSTITUCIONAL,
  NAV_CONTENIDO,
  DIPLOMADO_WHATSAPP_URL,
  HEADER_BRAND_LOCKUP,
  type NavInstitucionalItem,
  type NavLink,
} from "@/lib/site-config";
import { BrandLogo } from "@/components/BrandLogo";
import { brandLogoHeightClass } from "@/lib/brand-clear-space";

const menuLinkClass =
  "block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-na-muted transition-colors hover:bg-na-heket/10 hover:text-na-heketDark";

const subLinkClass =
  "block rounded-lg px-3 py-2 text-sm font-medium text-na-muted transition-colors hover:bg-na-heket/10 hover:text-na-heketDark";

function InstitucionalNavGroup({
  label,
  href,
  items,
  open,
  onToggle,
  onNavigate,
}: {
  label: string;
  href: string;
  items: { href: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="rounded-xl">
      <div className="flex items-stretch rounded-xl">
        <Link
          href={href}
          className="min-w-0 flex-1 rounded-l-xl px-3.5 py-2.5 text-sm font-semibold text-na-muted transition-colors hover:bg-na-heket/10 hover:text-na-heketDark"
          onClick={onNavigate}
        >
          {label}
        </Link>
        <button
          type="button"
          className="flex shrink-0 items-center rounded-r-xl px-3 text-na-kefer transition-colors hover:bg-na-heket/10"
          aria-expanded={open}
          aria-label={`${open ? "Ocultar" : "Mostrar"} opciones de ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open ? (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-na-heket/15 py-1 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={subLinkClass}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InstitucionalNavDropdown() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setOpenGroup(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  const close = () => {
    setMenuOpen(false);
    setOpenGroup(null);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors ${
          menuOpen
            ? "bg-na-heket/10 text-na-heketDark"
            : "text-na-muted hover:bg-na-heket/10 hover:text-na-heketDark"
        }`}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {NAV_INSTITUCIONAL.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>
      {menuOpen ? (
        <div className="absolute left-0 top-full z-50 w-80 pt-2">
          <div className="max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-na-heket/10 bg-na-surface p-2 shadow-na-card">
            {NAV_INSTITUCIONAL.items.map((item) =>
              item.type === "group" ? (
                <InstitucionalNavGroup
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  items={[...item.items]}
                  open={openGroup === item.label}
                  onToggle={() =>
                    setOpenGroup((prev) =>
                      prev === item.label ? null : item.label,
                    )
                  }
                  onNavigate={close}
                />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={menuLinkClass}
                  onClick={close}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileInstitucionalNav({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggle = (label: string) =>
    setOpenGroup((prev) => (prev === label ? null : label));

  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-na-kefer">
        {NAV_INSTITUCIONAL.label}
      </p>
      <div className="ml-1 flex flex-col gap-0.5 border-l-2 border-na-heket/15 pl-3">
        {NAV_INSTITUCIONAL.items.map((item: NavInstitucionalItem) =>
          item.type === "group" ? (
            <div key={item.label}>
              <div className="flex items-stretch">
                <Link
                  href={item.href}
                  className="min-w-0 flex-1 rounded-l-lg px-3 py-2.5 text-sm font-semibold text-na-ink hover:bg-na-sand"
                  onClick={onNavigate}
                >
                  {item.label}
                </Link>
                <button
                  type="button"
                  className="flex shrink-0 items-center rounded-r-lg px-3 text-na-kefer hover:bg-na-sand"
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
                <div className="ml-2 flex flex-col gap-0.5 border-l border-na-heket/10 pl-3">
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-na-ink hover:bg-na-sand"
                      onClick={onNavigate}
                    >
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
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-na-ink hover:bg-na-sand"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

function MainNavLink({
  item,
  className,
  onNavigate,
}: {
  item: NavLink;
  className: string;
  onNavigate?: () => void;
}) {
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

export function Header() {
  const [open, setOpen] = useState(false);

  const navLinkClass =
    "rounded-full px-3.5 py-2 text-sm font-semibold tracking-wide text-na-muted transition-colors hover:bg-na-heket/10 hover:text-na-heketDark";

  const mobileLinkClass =
    "rounded-lg px-3 py-3 text-base font-medium text-na-ink hover:bg-na-sand";

  const closeMobile = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 overflow-visible border-b border-na-heket/10 bg-na-surface/95 shadow-na-soft backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
          <Link
            href="/"
            onClick={closeMobile}
            aria-label="Inicio — Nueva Acrópolis"
            className="flex shrink-0 items-center overflow-visible outline-none transition-opacity hover:opacity-90"
          >
            <BrandLogo
              priority
              align="start"
              lockup={HEADER_BRAND_LOCKUP}
              render="raster"
              clearSpace={false}
              className={brandLogoHeightClass.headerFilial}
              maxWidthClass="max-w-[min(92vw,13rem)]"
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <InstitucionalNavDropdown />
            {NAV_LINKS.flatMap((item) => {
              const link = (
                <MainNavLink
                  key={item.href}
                  item={item}
                  className={navLinkClass}
                />
              );

              if (item.href === "/voluntariado") {
                return [
                  link,
                  <Link
                    key="nav-contenido"
                    href={NAV_CONTENIDO.hubHref}
                    className={navLinkClass}
                  >
                    {NAV_CONTENIDO.label}
                  </Link>,
                ];
              }

              return [link];
            })}
          </nav>

          <a
            href={DIPLOMADO_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-na-heket px-4 py-2 text-sm font-semibold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer lg:inline-flex"
          >
            Contáctanos
          </a>

          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-na-heket lg:hidden"
            aria-expanded={open}
            aria-label="Menú"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-na-heket/10 bg-na-surface px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              <MobileInstitucionalNav onNavigate={closeMobile} />
              {NAV_LINKS.flatMap((item) => {
                const link = (
                  <MainNavLink
                    key={item.href}
                    item={item}
                    className={mobileLinkClass}
                    onNavigate={closeMobile}
                  />
                );

                if (item.href === "/voluntariado") {
                  return [
                    link,
                    <Link
                      key="nav-contenido"
                      href={NAV_CONTENIDO.hubHref}
                      className={mobileLinkClass}
                      onClick={closeMobile}
                    >
                      {NAV_CONTENIDO.label}
                    </Link>,
                  ];
                }

                return [link];
              })}

              <a
                href={DIPLOMADO_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-full bg-na-heket py-3 text-center text-sm font-semibold text-white"
                onClick={closeMobile}
              >
                Contáctanos
              </a>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
