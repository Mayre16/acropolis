import Link from "next/link";
import { CirculoBrandMark } from "@/components/CirculoBrandMark";
import { LEGAL_LINKS, PRINCIPAL_SITE_URL } from "@/lib/site-config";

export function CirculoFooter() {
  return (
    <footer className="border-t border-[var(--ca-brand)]/15 bg-[var(--ca-brand-dark)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/" aria-label="Círculo de Amigos — inicio">
              <div className="max-w-xs rounded-xl bg-white p-3">
                <CirculoBrandMark size="sm" />
              </div>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              Espacio abierto para quienes valoran los principios de Nueva
              Acrópolis y desean participar en sus actividades.
            </p>
          </div>
          <nav aria-label="Enlaces legales e institucionales">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
              Enlaces
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={PRINCIPAL_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Nueva Acrópolis RD
                </a>
              </li>
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-white/15 pt-6 text-xs text-white/70">
          © {new Date().getFullYear()} Círculo de Amigos OINADOM · Nueva
          Acrópolis República Dominicana
        </p>
      </div>
    </footer>
  );
}
