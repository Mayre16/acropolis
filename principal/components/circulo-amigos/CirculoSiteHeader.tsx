"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  CIRCULO_HEADER_MARK_ASPECT,
  CirculoBrandMark,
} from "@/components/circulo-amigos/CirculoBrandMark";
import {
  CIRCULO_AMIGOS_PATH,
  CIRCULO_QUIENES_SOMOS_PATH,
} from "@/lib/circulo-amigos-content";
import { CirculoInscribeteNavLink } from "@/components/circulo-amigos/CirculoInscribeteNavLink";
import "./CirculoSiteHeader.css";

const NAV = [
  { id: "inicio", label: "Inicio", href: CIRCULO_AMIGOS_PATH },
  {
    id: "quienes-somos",
    label: "Quiénes somos",
    href: CIRCULO_QUIENES_SOMOS_PATH,
  },
  { id: "inscripcion", label: "Inscríbete", href: null },
] as const;

function navIsActive(pathname: string, href: string | null): boolean {
  if (!href) return false;
  if (href === CIRCULO_AMIGOS_PATH) return pathname === CIRCULO_AMIGOS_PATH;
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CirculoSiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMobile = () => setOpen(false);

  const desktopLinkClass = (active: boolean) =>
    `circulo-site-header__link${active ? " circulo-site-header__link--active" : ""}`;

  const mobileLinkClass = (active: boolean) =>
    `circulo-site-header__mobile-link${active ? " circulo-site-header__mobile-link--active" : ""}`;

  return (
    <header
      className="circulo-site-header"
      style={{
        ["--circulo-mark-aspect" as string]: String(CIRCULO_HEADER_MARK_ASPECT),
      }}
    >
      <div className="circulo-site-header__row">
        <Link
          href={CIRCULO_AMIGOS_PATH}
          onClick={closeMobile}
          className="circulo-site-header__brand"
          aria-label="Círculo de Amigos OINADOM — inicio"
        >
          <CirculoBrandMark
            size="lg"
            priority
            className="circulo-site-header__mark"
          />
        </Link>

        <button
          type="button"
          className="circulo-site-header__menu-btn"
          aria-expanded={open}
          aria-controls="circulo-mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <nav
          className="circulo-site-header__nav"
          aria-label="Secciones del Círculo de Amigos"
        >
          {NAV.map((item) =>
            item.id === "inscripcion" ? (
              <CirculoInscribeteNavLink
                key={item.id}
                className={desktopLinkClass(false)}
              >
                {item.label}
              </CirculoInscribeteNavLink>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={desktopLinkClass(navIsActive(pathname, item.href))}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      {open ? (
        <nav
          id="circulo-mobile-nav"
          className="circulo-site-header__mobile-nav"
          aria-label="Menú móvil"
        >
          <ul className="circulo-site-header__mobile-list">
            {NAV.map((item) => (
              <li key={item.id}>
                {item.id === "inscripcion" ? (
                  <CirculoInscribeteNavLink
                    className={mobileLinkClass(false)}
                    onNavigate={closeMobile}
                  >
                    {item.label}
                  </CirculoInscribeteNavLink>
                ) : (
                  <Link
                    href={item.href}
                    className={mobileLinkClass(navIsActive(pathname, item.href))}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
