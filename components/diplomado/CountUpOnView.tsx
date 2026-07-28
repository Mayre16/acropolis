"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString("es-DO");
}

type CountUpOnViewProps = {
  end: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  delayMs?: number;
  /** Si se pasa, la animación depende del padre (sección impacto). */
  startWhen?: boolean;
  className?: string;
};

export function CountUpOnView({
  end,
  suffix = "",
  prefix = "",
  durationMs = 2200,
  delayMs = 0,
  startWhen,
  className,
}: CountUpOnViewProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [selfStarted, setSelfStarted] = useState(false);
  const controlled = startWhen !== undefined;
  const started = controlled ? startWhen : selfStarted;

  useEffect(() => {
    if (controlled) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSelfStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [controlled]);

  useEffect(() => {
    if (!started) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(end);
      return;
    }

    let frame = 0;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        setDisplay(end * easeOutCubic(t));
        if (t < 1) frame = requestAnimationFrame(tick);
        else setDisplay(end);
      };

      frame = requestAnimationFrame(tick);
    };

    if (delayMs > 0) {
      delayTimer = setTimeout(run, delayMs);
    } else {
      run();
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      cancelAnimationFrame(frame);
    };
  }, [started, end, durationMs, delayMs]);

  return (
    <span
      ref={ref}
      className={[
        className,
        "tabular-nums transition-opacity duration-300",
        started ? "opacity-100" : "opacity-90",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {prefix}
      {formatCount(display)}
      {suffix}
    </span>
  );
}
