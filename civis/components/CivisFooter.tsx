import Link from "next/link";

import { CivisBrandMark } from "@/components/CivisBrandMark";
import { CivisNaSectionLogo } from "@/components/CivisNaSectionLogo";

import { CIVIS_HEADER_NAV } from "@/lib/civis-content";

import "./CivisFooter.css";

export function CivisFooter() {
  return (
    <footer className="civis-footer">
      <div className="civis-footer__inner">
        <div className="civis-footer__grid">
          <div className="min-w-0">
            <Link
              href="/"
              className="block w-full max-w-full leading-none sm:max-w-[min(100%,18rem)]"
              aria-label="Civis Consulting — inicio"
            >
              <CivisBrandMark size="sm" />
            </Link>
            <p className="civis-footer__tagline">
              Talleres y formación para empresas, equipos y líderes.
            </p>
          </div>

          <div className="civis-footer__na-mark">
            <CivisNaSectionLogo context="footer" align="center" />
          </div>

          <nav aria-label="Secciones del sitio" className="civis-footer__nav">
            <p className="civis-footer__nav-label">Navegación</p>
            <ul className="civis-footer__nav-list">
              {CIVIS_HEADER_NAV.map(({ href, label, id }) => (
                <li key={id}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="civis-footer__legal-row">
          <p className="civis-footer__legal">
            © {new Date().getFullYear()} Civis Consulting · Nueva Acrópolis RD
          </p>
        </div>
      </div>
    </footer>
  );
}
