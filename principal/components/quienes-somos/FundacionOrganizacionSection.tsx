import {
  Building2,
  CalendarClock,
  Flag,
  Globe2,
  MapPin,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { brandLogoHeightClass } from "@/lib/brand-clear-space";
import { FUNDACION_ORGANIZACION_BLOCKS } from "@/lib/institucional-content";

const STATS = [
  { icon: CalendarClock, value: "1957", label: "Fundación en Buenos Aires" },
  { icon: Flag, value: "1998", label: "Fundación en República Dominicana" },
  { icon: Globe2, value: "+50 países", label: "Presencia internacional" },
  { icon: MapPin, value: "~500 sedes", label: "En todo el mundo" },
  { icon: Building2, value: "Bruselas", label: "Sede internacional (OINA)" },
];

export function FundacionOrganizacionSection() {
  return (
    <section
      id="fundacion-organizacion"
      className="scroll-mt-36 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Organización internacional
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Fundación, Organización y Estructura
        </h2>

        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {FUNDACION_ORGANIZACION_BLOCKS.map((block) => (
            <li
              key={block.title}
              className="rounded-2xl border border-na-heket/10 bg-na-surface p-6 shadow-na-soft sm:p-7"
            >
              <h3 className="text-lg font-black text-na-heketDark">
                {block.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-na-kefer">
                {block.question}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-na-muted">
                {block.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 shadow-na-card sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-na-helios">
                OINA en cifras
              </p>
              <p className="mt-4 max-w-xl text-white/80">
                Una red mundial con una misma Carta Fundacional. Nueva
                Acrópolis República Dominicana forma parte de NA Internacional.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex justify-center overflow-visible">
                <BrandLogo
                  lockup="oinadom"
                  variant="white"
                  render="raster"
                  className={brandLogoHeightClass.sectionStacked}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-xl bg-white/5 p-4">
                    <Icon className="h-5 w-5 text-na-helios" strokeWidth={1.8} />
                    <p className="mt-2 text-lg font-black text-white">{value}</p>
                    <p className="text-xs leading-snug text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
