"use client";

import {
  Coins,
  HeartHandshake,
  Pencil,
  Users,
  type LucideIcon,
} from "lucide-react";
import { VoluntariadoDonacionInquiry } from "@/components/VoluntariadoDonacionInquiry";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import {
  useVoluntariadoSostenibilidadDisplay,
  VOLUNTARIADO_SOSTENIBILIDAD_SECTION_ID,
  voluntariadoSostenibilidadCardId,
} from "@/lib/cms/voluntariado-display";
import type { CmsVoluntariadoInfoCard } from "@/lib/cms/types";

const INFO_ICONS: Record<NonNullable<CmsVoluntariadoInfoCard["icon"]>, LucideIcon> = {
  users: Users,
  coins: Coins,
  heart: HeartHandshake,
};

function isRealExternalHref(href: string | undefined) {
  const h = href?.trim();
  if (!h || h.startsWith("#")) return false;
  return true;
}

function CardCta({ card }: { card: CmsVoluntariadoInfoCard }) {
  if (!card.cta?.trim()) return null;

  const buttonClass =
    "mt-5 inline-flex items-center gap-2 rounded-full bg-na-amon px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-amon/25 transition hover:brightness-105";

  if (card.id === "donacion" && !isRealExternalHref(card.ctaHref)) {
    return (
      <VoluntariadoDonacionInquiry
        triggerLabel={card.cta}
        triggerClassName={buttonClass}
      />
    );
  }

  const customHref = card.ctaHref?.trim();
  if (!customHref) return null;

  return (
    <a
      href={customHref}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass}
    >
      {card.cta}
    </a>
  );
}

export function VoluntariadoSostenibilidadSection() {
  const edit = useVoluntariadoCmsEdit();
  const section = useVoluntariadoSostenibilidadDisplay();

  return (
    <section className="relative border-t border-na-heket/10 py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar donación"
            onClick={() =>
              edit.setSelectedId(VOLUNTARIADO_SOSTENIBILIDAD_SECTION_ID)
            }
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {section.eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {section.title}
        </h2>
        <p className="mt-4 max-w-3xl text-na-muted">{section.intro}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {section.cards.map((card, i) => {
            const Icon = INFO_ICONS[card.icon ?? "users"] ?? Users;
            const highlighted = card.icon === "heart";
            return (
              <div
                key={card.id}
                className={`relative rounded-2xl border p-6 shadow-na-soft ${
                  highlighted
                    ? "border-na-amon/20 bg-gradient-to-br from-na-amon/10 to-na-helios/10"
                    : "border-na-heket/10 bg-na-surface"
                }`}
              >
                {edit?.ready ? (
                  <button
                    type="button"
                    onClick={() =>
                      edit.setSelectedId(voluntariadoSostenibilidadCardId(card.id))
                    }
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                    aria-label={`Editar ${card.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    highlighted
                      ? "bg-na-amon/15 text-na-amon"
                      : i === 1
                        ? "bg-na-kefer/10 text-na-kefer"
                        : "bg-na-heket/10 text-na-heket"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-black text-na-heketDark">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-na-muted">
                  {card.text}
                </p>
                <CardCta card={card} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
