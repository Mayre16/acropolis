import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { NaBrandLockupGroup } from "@/components/NaBrandLockupGroup";
import {
  BRAND_FOOTER_TAGLINE,
  FOOTER_NAV_PRIMARY,
  FOOTER_NAV_SECONDARY,
  LEGAL_LINKS,
  SOCIAL_LINKS,
  INSTAGRAM_HANDLE,
  DIPLOMADO_WHATSAPP_URL,
  LEGAL_DOMICILE,
} from "@/lib/site-config";
import type { NavLink } from "@/lib/site-config";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";
import "./Footer.css";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function FooterNavList({ items }: { items: NavLink[] }) {
  return (
    <ul className="principal-footer__nav-list">
      {items.map((item) => (
        <li key={item.href}>
          {item.external ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
            </a>
          ) : (
            <Link href={item.href}>{item.label}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="principal-footer">
      <div className="principal-footer__inner">
        <div className="principal-footer__grid">
          <div className="principal-footer__connect min-w-0">
            <p className="principal-footer__section-label">Conectar</p>
            <div className="principal-footer__social">
              <LeaveSiteLink
                href={SOCIAL_LINKS.instagram}
                aria-label={`Instagram @${INSTAGRAM_HANDLE}`}
              >
                <InstagramIcon className="h-5 w-5" />
              </LeaveSiteLink>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Nueva Acrópolis"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Nueva Acrópolis RD"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={DIPLOMADO_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
            <p className="principal-footer__tagline">{BRAND_FOOTER_TAGLINE}</p>
          </div>

          <div className="principal-footer__na-mark">
            <NaBrandLockupGroup
              lockup="oinadom"
              variant="white"
              align="center"
              size="footer"
              descriptorProminence="hero"
              maxWidthClass="max-w-[min(92vw,14.75rem)]"
            />
          </div>

          <div className="principal-footer__nav-col min-w-0">
            <nav aria-label="Secciones del sitio" className="principal-footer__nav-block">
              <p className="principal-footer__section-label">Navegación</p>
              <FooterNavList items={FOOTER_NAV_PRIMARY} />
              <FooterNavList items={FOOTER_NAV_SECONDARY} />
            </nav>
          </div>
        </div>

        <div className="principal-footer__meta-row">
          <p className="principal-footer__domicile">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Domicilio legal: {LEGAL_DOMICILE}</span>
          </p>
          <nav aria-label="Enlaces legales">
            <ul className="principal-footer__legal-inline">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="principal-footer__legal-bar">
        <div className="principal-footer__legal-bar-inner">
          <span>
            © {new Date().getFullYear()} Nueva Acrópolis República Dominicana
          </span>
          <span>Organización Internacional sin fines de lucro</span>
        </div>
      </div>
    </footer>
  );
}
