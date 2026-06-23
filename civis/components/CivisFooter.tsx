import Link from "next/link";

import { CivisBrandMark } from "@/components/CivisBrandMark";
import { CivisNaSectionLogo } from "@/components/CivisNaSectionLogo";

import { CIVIS_FOOTER_NAV } from "@/lib/civis-content";
import { footerNavGridColumns } from "@/lib/footer-nav-grid";

import "./CivisFooter.css";

function footerNavRows(items: typeof CIVIS_FOOTER_NAV) {
  const split = footerNavGridColumns(items.length);
  return [items.slice(0, split), items.slice(split)] as const;
}

export function CivisFooter() {
  const [navRowTop, navRowBottom] = footerNavRows(CIVIS_FOOTER_NAV);

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
            <div className="civis-footer__nav-rows">
              {[navRowTop, navRowBottom].map((row) => (
                <ul key={row.map((item) => item.id).join("-")} className="civis-footer__nav-row">
                  {row.map(({ href, label, id }) => (
                    <li key={id}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
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
