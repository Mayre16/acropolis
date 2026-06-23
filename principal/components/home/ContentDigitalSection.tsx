import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  brandLogoHeightClass,
  brandLogoSectionGapClass,
} from "@/lib/brand-clear-space";
import {
  getNavContenidoItems,
  NAV_CONTENIDO,
} from "@/lib/site-config";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";

export function ContentDigitalSection() {
  const items = getNavContenidoItems();

  return (
    <section className="border-t border-na-heket/10 bg-[#eef0f2] py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div
          className={`mx-auto flex items-center justify-center overflow-visible ${brandLogoHeightClass.contentDigitalAnagramBox}`}
        >
          <BrandLogo
            lockup="na-solo"
            variant="color"
            render="raster"
            align="center"
            className={brandLogoHeightClass.contentDigitalAnagram}
            maxWidthClass="max-w-full"
            imageStyle={{
              height: "auto",
              maxHeight: "var(--brand-logo-h)",
              width: "auto",
              maxWidth: "100%",
            }}
          />
        </div>
        <h2
          className={`text-balance text-2xl font-black text-na-heketDark sm:text-3xl ${brandLogoSectionGapClass}`}
        >
          Descubre nuestro contenido digital
        </h2>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-na-heket">
          {items.map((item, i) => (
            <li key={item.href} className="inline-flex items-center gap-4">
              {i > 0 ? (
                <span className="hidden text-na-heket/30 sm:inline" aria-hidden>
                  ·
                </span>
              ) : null}
              {item.external ? (
                <LeaveSiteLink href={item.href} className="hover:text-na-kefer">
                  {item.label}
                </LeaveSiteLink>
              ) : (
                <Link href={item.href} className="hover:text-na-kefer">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <Link
          href={NAV_CONTENIDO.hubHref}
          className="mt-8 inline-flex items-center gap-2 rounded border-2 border-na-heket px-8 py-3 text-xs font-bold uppercase tracking-wider text-na-heket transition hover:bg-na-heket hover:text-white sm:text-sm"
        >
          Acceder al contenido
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
