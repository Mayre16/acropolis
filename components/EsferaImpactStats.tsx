"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import type { EsferaImpactStat } from "@/lib/esfera-content";

type EsferaImpactStatsProps = {
  stats: EsferaImpactStat[];
  statIds?: string[];
  onEditStat?: (id: string) => void;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

function CountUpValue({
  target,
  suffix = "",
  active,
  reducedMotion,
}: {
  target: number;
  suffix?: string;
  active: boolean;
  reducedMotion: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    if (reducedMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    const duration = 1600;
    let start: number | null = null;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reducedMotion, target]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}

function ImpactStatCard({
  stat,
  index,
  active,
  reducedMotion,
  statId,
  onEdit,
}: {
  stat: EsferaImpactStat;
  index: number;
  active: boolean;
  reducedMotion: boolean;
  statId?: string;
  onEdit?: (id: string) => void;
}) {
  return (
    <li
      className="relative rounded-2xl border border-na-heket/10 bg-na-surface px-6 py-8 text-center shadow-na-soft"
      style={{ transitionDelay: active ? `${index * 80}ms` : undefined }}
    >
      {onEdit && statId ? (
        <button
          type="button"
          onClick={() => onEdit(statId)}
          className="absolute right-3 top-3 rounded-full bg-na-helios p-1.5 text-na-ink shadow"
          aria-label={`Editar ${stat.label}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      ) : null}
      <p className="text-4xl font-black tabular-nums text-na-heket sm:text-5xl">
        {"countTo" in stat ? (
          <CountUpValue
            target={stat.countTo}
            suffix={stat.suffix}
            active={active}
            reducedMotion={reducedMotion}
          />
        ) : (
          stat.display
        )}
      </p>
      <p className="mt-2 text-sm font-medium text-na-muted">{stat.label}</p>
    </li>
  );
}

export function EsferaImpactStats({
  stats,
  statIds,
  onEditStat,
}: EsferaImpactStatsProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={rootRef} className="mt-10 grid gap-6 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <ImpactStatCard
          key={statIds?.[i] ?? stat.label}
          stat={stat}
          index={i}
          active={active}
          reducedMotion={reducedMotion}
          statId={statIds?.[i]}
          onEdit={onEditStat}
        />
      ))}
    </ul>
  );
}
