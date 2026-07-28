"use client";

import { useEffect, useRef, useState } from "react";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { CountUpOnView } from "@/components/diplomado/CountUpOnView";
import { SpinningGlobe } from "@/components/diplomado/SpinningGlobe";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import { useDiplomadoPageDisplay } from "@/lib/cms/diplomado-display";

export function DiplomadoImpactSection() {
  const page = useDiplomadoPageDisplay();
  const edit = useFilosofiaCmsEdit();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const stats = page.impactStats ?? [];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px 8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="diplomado-impact"
      className="relative px-4 py-10 text-white lg:px-8 lg:py-14"
      aria-label="Impacto mundial"
    >
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 lg:right-8">
          <CmsSectionEditBar
            label="Editar cifras e impacto"
            onClick={() => edit.setActiveSection("impact")}
          />
        </div>
      ) : null}
      <CountUpOnView
        end={page.impactHeadlineEnd ?? 500_000}
        suffix={page.impactHeadlineSuffix ?? "+"}
        startWhen={inView}
        durationMs={2600}
        delayMs={0}
        className="block text-[3.25rem] font-semibold leading-none text-[var(--dip-gold-soft)] diplomado-count-glow"
      />
      <p className="mt-3 text-2xl font-semibold leading-snug">
        {page.impactTitle}
      </p>
      <p className="mt-3 text-sm font-normal text-white/85">
        {page.impactSubtitle}
      </p>

      <div className="diplomado-impact-divider my-8" />

      <ul className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-3">
        {stats.map((s, index) => (
          <li key={s.id}>
            <CountUpOnView
              end={s.end}
              suffix={s.suffix}
              startWhen={inView}
              durationMs={2000}
              delayMs={350 + index * 140}
              className="block text-[1.65rem] font-semibold leading-none"
            />
            <p className="mt-2 text-sm leading-snug text-[#b0bfb6]">{s.label}</p>
          </li>
        ))}
      </ul>

      <SpinningGlobe />
    </section>
  );
}
