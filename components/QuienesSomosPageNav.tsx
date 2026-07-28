"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  QUIENES_SOMOS_SECTIONS,
  type QuienesSomosSectionId,
} from "@/lib/institucional-content";
import {
  institutionalSectionFromPathname,
  institutionalSectionPath,
} from "@/lib/institucional-paths";

type Props = {
  initialSection?: QuienesSomosSectionId;
};

export function QuienesSomosPageNav({ initialSection }: Props) {
  const pathname = usePathname();
  const [active, setActive] = useState<QuienesSomosSectionId>(
    initialSection ?? "que-es",
  );

  useEffect(() => {
    const fromPath = institutionalSectionFromPathname(pathname);
    if (fromPath) setActive(fromPath);
  }, [pathname]);

  useEffect(() => {
    const elements = QUIENES_SOMOS_SECTIONS.map((s) =>
      document.getElementById(s.id),
    ).filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id as QuienesSomosSectionId);
        }
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0, 0.15, 0.4] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: QuienesSomosSectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const section =
      initialSection ?? institutionalSectionFromPathname(pathname);
    if (!section) return;
    requestAnimationFrame(() => scrollTo(section));
  }, [initialSection, pathname, scrollTo]);

  return (
    <nav
      className="sticky top-[4.75rem] z-40 border-b border-na-heket/10 bg-white/95 shadow-sm backdrop-blur-md"
      aria-label="Secciones de Quiénes somos"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-3 sm:gap-2 sm:px-6">
        {QUIENES_SOMOS_SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          const href = institutionalSectionPath(id);
          return (
            <Link
              key={id}
              href={href}
              onClick={(e) => {
                if (pathname.replace(/\/$/, "") === href.replace(/\/$/, "")) {
                  e.preventDefault();
                  scrollTo(id);
                }
              }}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition sm:px-4 ${
                isActive
                  ? "bg-na-heket text-white shadow-md shadow-na-heket/20"
                  : "bg-na-heket/[0.06] text-na-muted ring-1 ring-na-heket/12 hover:bg-na-heket/10 hover:text-na-heketDark"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
