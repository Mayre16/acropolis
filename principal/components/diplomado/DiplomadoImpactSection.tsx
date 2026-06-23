"use client";

import { useEffect, useRef, useState } from "react";
import { CountUpOnView } from "@/components/diplomado/CountUpOnView";
import { SpinningGlobe } from "@/components/diplomado/SpinningGlobe";
import { DIPLOMADO_IMPACT } from "@/lib/diplomado-content";

export function DiplomadoImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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
    <section ref={sectionRef} className="px-4 py-10 text-white lg:px-8 lg:py-14" aria-label="Impacto mundial">
      <CountUpOnView
        end={DIPLOMADO_IMPACT.headline.end}
        suffix={DIPLOMADO_IMPACT.headline.suffix}
        startWhen={inView}
        durationMs={2600}
        delayMs={0}
        className="block text-[3.25rem] font-semibold leading-none text-[var(--dip-gold-soft)] diplomado-count-glow"
      />
      <p className="mt-3 text-2xl font-semibold leading-snug">{DIPLOMADO_IMPACT.title}</p>
      <p className="mt-3 text-sm font-normal text-white/85">{DIPLOMADO_IMPACT.subtitle}</p>

      <div className="diplomado-impact-divider my-8" />

      <ul className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-3">
        {DIPLOMADO_IMPACT.stats.map((s, index) => (
          <li key={s.label}>
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
