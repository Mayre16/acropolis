"use client";

import Link from "next/link";
import { NaBrandLockupGroup } from "@/components/NaBrandLockupGroup";
import { CirculoBrandMark } from "@/components/circulo-amigos/CirculoBrandMark";
import { CirculoInscribeteNavLink } from "@/components/circulo-amigos/CirculoInscribeteNavLink";
import {
  CIRCULO_FOOTER_NAV,
  CIRCULO_HOME_PATH,
} from "@/lib/circulo-amigos-content";
import { footerNavGridColumns } from "@/lib/footer-nav-grid";
import "./CirculoFooter.css";

function footerNavRows() {
  const split = footerNavGridColumns(CIRCULO_FOOTER_NAV.length);
  return [CIRCULO_FOOTER_NAV.slice(0, split), CIRCULO_FOOTER_NAV.slice(split)] as const;
}

export function CirculoFooter() {
  const [navRowTop, navRowBottom] = footerNavRows();

  return (
    <footer className="circulo-footer">
      <div className="circulo-footer__inner">
        <div className="circulo-footer__grid">
          <div className="circulo-footer__brand-col">
            <Link
              href={CIRCULO_HOME_PATH}
              className="circulo-footer__brand"
              aria-label="Círculo de Amigos — inicio"
            >
              <CirculoBrandMark size="sm" className="circulo-footer__mark" />
            </Link>
          </div>

          <div className="circulo-footer__na-mark">
            <NaBrandLockupGroup
              lockup="oinadom"
              size="footer"
              align="center"
              render="raster"
              maxWidthClass="max-w-[min(92vw,14rem)]"
            />
          </div>

          <nav aria-label="Secciones del sitio" className="circulo-footer__nav">
            <p className="circulo-footer__nav-label">Navegación</p>
            <div className="circulo-footer__nav-rows">
              {[navRowTop, navRowBottom].map((row) => (
                <ul
                  key={row.map((item) => item.id).join("-")}
                  className="circulo-footer__nav-row"
                >
                  {row.map((item) => (
                    <li key={item.id}>
                      {item.id === "inscripcion" ? (
                        <CirculoInscribeteNavLink>{item.label}</CirculoInscribeteNavLink>
                      ) : (
                        <Link href={item.href!}>{item.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </nav>
        </div>

        <div className="circulo-footer__legal-row">
          <p className="circulo-footer__legal">
            © {new Date().getFullYear()} Círculo de Amigos OINADOM · Nueva
            Acrópolis RD
          </p>
        </div>
      </div>
    </footer>
  );
}
