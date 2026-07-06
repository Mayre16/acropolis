"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  CIRCULO_HEADER_MARK_ASPECT,
  CirculoBrandMark,
} from "@/components/CirculoBrandMark";
import { PRINCIPAL_SITE_URL } from "@/lib/site-config";
import "./CirculoSiteHeader.css";

const NAV: Array<{
  id: string;
  label: string;
  href: string;
  external?: boolean;
}> = [
  { id: "inicio", label: "Inicio", href: "/" },
  { id: "inscripcion", label: "Inscríbete", href: "/#inscripcion" },
  {
    id: "na",
    label: "Nueva Acrópolis",
    href: PRINCIPAL_SITE_URL,
    external: true,
  },
] as const;

/** Header integrado — identificador Círculo de Amigos (placeholder) + menú azul claro. */
export function CirculoSiteHeader() {
  const [open, setOpen] = useState(false);
  const closeMobile = () => setOpen(false);

  return (
    <header
      className="circulo-site-header"
      style={{
        ["--circulo-mark-aspect" as string]: String(CIRCULO_HEADER_MARK_ASPECT),
      }}
    >
      <div className="circulo-site-header__row">
        <Link
          href="/"
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
            item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="circulo-site-header__link"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="circulo-site-header__link"
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
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="circulo-site-header__mobile-link"
                    onClick={closeMobile}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="circulo-site-header__mobile-link"
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
