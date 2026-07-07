"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  CIVIS_HEADER_MARK_ASPECT,
  CivisBrandMark,
} from "@/components/CivisBrandMark";
import {
  CIVIS_HEADER_NAV,
  civisNavIsActive,
  type CivisNavItem,
} from "@/lib/civis-content";
import {
  CIVIS_BRAND,
} from "@/lib/site-config";
import "./CivisSiteHeader.css";

/** Header integrado: identificador Civis a color + menú sobre la franja de marca. */
export function CivisSiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMobile = () => setOpen(false);

  const isActive = (item: CivisNavItem) =>
    civisNavIsActive(pathname, "", item);

  const desktopLinkClass = (active: boolean) =>
    `civis-site-header__link${active ? " civis-site-header__link--active" : ""}`;

  const mobileLinkClass = (active: boolean) =>
    `civis-site-header__mobile-link${active ? " civis-site-header__mobile-link--active" : ""}`;

  return (
    <header
      className="civis-site-header"
      style={{
        ["--civis-mark-aspect" as string]: String(CIVIS_HEADER_MARK_ASPECT),
        ["--civis-header-brand" as string]: CIVIS_BRAND.main,
      }}
    >
      <div className="civis-site-header__row">
        <Link
          href="/"
          onClick={closeMobile}
          className="civis-site-header__brand"
          aria-label="Civis Consulting — inicio"
        >
          <CivisBrandMark
            size="lg"
            priority
            className="civis-site-header__mark"
          />
        </Link>

        <button
          type="button"
          className="civis-site-header__menu-btn"
          aria-expanded={open}
          aria-controls="civis-mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <nav
          className="civis-site-header__nav"
          aria-label="Secciones de Civis Consulting"
        >
          {CIVIS_HEADER_NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={desktopLinkClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {open ? (
        <nav
          id="civis-mobile-nav"
          className="civis-site-header__mobile-nav"
          aria-label="Menú móvil de Civis Consulting"
        >
          <ul className="civis-site-header__mobile-list">
            {CIVIS_HEADER_NAV.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={mobileLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
