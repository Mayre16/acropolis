"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Coins, HeartHandshake, type LucideIcon } from "lucide-react";
import {
  CmsEditPencil,
  CmsSectionEditBar,
} from "@/components/cms/CmsEditPencil";
import { openCollaborateTabEdit } from "@/components/cms/CollaborateCmsPanels";
import { InquiryMailForm } from "@/components/InquiryMailForm";
import { SolicitudEsferaDialog } from "@/components/SolicitudEsferaDialog";
import { VolunteerForm } from "@/components/VolunteerForm";
import {
  buildEsferaCollaborateMailto,
  buildVoluntariadoDonacionMailto,
} from "@/lib/contact-routing";
import {
  COLLABORATE_SECTION_ID,
  useCollaborateCmsEdit,
  useCollaborateDisplay,
} from "@/lib/cms/collaborate-display";
import type { CmsCollaborateTab, CmsCollaborateTabId } from "@/lib/cms/types";
import { isEsferaSolicitudHref } from "@/lib/esfera-solicitud";

const TAB_ICONS: Record<CmsCollaborateTabId, LucideIcon> = {
  donar: Coins,
  voluntario: HeartHandshake,
  alianzas: Building2,
};

type CollaborateInquiry = "donar" | "alianzas";

export function EsferaCollaborate() {
  const [active, setActive] = useState(0);
  const [inquiry, setInquiry] = useState<CollaborateInquiry | null>(null);
  const block = useCollaborateDisplay();
  const edit = useCollaborateCmsEdit();
  const tabs = block.tabs ?? [];
  const safeActive = Math.min(active, Math.max(0, tabs.length - 1));
  const t = tabs[safeActive];

  useEffect(() => {
    setInquiry(null);
  }, [safeActive]);

  if (!t) return null;

  const Icon = TAB_ICONS[t.id] ?? Coins;

  const primaryClass =
    "inline-flex justify-center rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer";

  return (
    <section className="relative border-y border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(COLLABORATE_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-balance text-center text-2xl font-black text-na-heketDark sm:text-3xl">
          {block.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-na-muted sm:text-base">
          {block.intro}
        </p>

        <div
          className="mt-8 flex flex-wrap justify-center gap-2 border-b border-na-heket/10 pb-px sm:mt-10"
          role="tablist"
          aria-label="Formas de colaborar"
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={safeActive === i}
              aria-controls={`esfera-panel-${tab.id}`}
              id={`esfera-tab-${tab.id}`}
              onClick={() => setActive(i)}
              className={`rounded-t-xl px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                safeActive === i
                  ? "bg-na-surface text-na-heket shadow-sm ring-1 ring-na-heket/15"
                  : "text-na-muted hover:bg-na-surface/80 hover:text-na-heketDark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`esfera-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`esfera-tab-${t.id}`}
          className="relative mx-auto mt-8 max-w-2xl rounded-2xl border border-na-heket/10 bg-na-surface p-6 shadow-na-soft sm:p-8"
        >
          {edit?.ready ? (
            <CmsEditPencil
              label={`Editar pestaña ${t.label}`}
              onClick={() => openCollaborateTabEdit(edit.setSelectedId, t.id)}
            />
          ) : null}

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-na-heket/10 text-na-heket">
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black text-na-heketDark">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-na-muted">
                {t.text}
              </p>
              {t.id === "voluntario" ? (
                <div className="mt-6">
                  <VolunteerForm
                    triggerLabel={t.cta || "Quiero ser voluntario/a"}
                    triggerClassName={primaryClass}
                  />
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <CollaborateCta
                    tab={t}
                    primaryClass={primaryClass}
                    onOpenInquiry={setInquiry}
                  />
                  {t.secondary?.label ? (
                    <CollaborateSecondaryCta tab={t} />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InquiryMailForm
        hideTrigger
        open={inquiry === "donar"}
        onOpenChange={(open) => setInquiry(open ? "donar" : null)}
        formKey="voluntariado_donacion"
        triggerLabel="Quiero donar"
        modalTitle="Quiero donar"
        modalIntro="Completa tus datos y enviaremos tu consulta al equipo de voluntariado."
        contextLines={[
          "Donación para proyectos de ecología, apoyo social y formación humanitaria.",
        ]}
        defaultMensaje="Indique monto, forma de aporte o cualquier detalle que debamos conocer (opcional)."
        buildMailto={buildVoluntariadoDonacionMailto}
      />

      <InquiryMailForm
        hideTrigger
        open={inquiry === "alianzas"}
        onOpenChange={(open) => setInquiry(open ? "alianzas" : null)}
        formKey="esfera_alianzas"
        triggerLabel="Proponer alianza"
        modalTitle="Proponer alianza"
        modalIntro="Completa tus datos y enviaremos tu solicitud al equipo de Punto Focal Esfera."
        contextLines={["Alianza institucional con Punto Focal Esfera."]}
        buildMailto={(base) => buildEsferaCollaborateMailto("alianzas", base)}
      />
    </section>
  );
}

function CollaborateCta({
  tab,
  primaryClass,
  onOpenInquiry,
}: {
  tab: CmsCollaborateTab;
  primaryClass: string;
  onOpenInquiry: (kind: CollaborateInquiry) => void;
}) {
  if (tab.id === "donar" || tab.id === "alianzas") {
    const inquiryKind = tab.id;
    return (
      <button
        type="button"
        className={primaryClass}
        onClick={() => onOpenInquiry(inquiryKind)}
      >
        {tab.cta}
      </button>
    );
  }

  if (tab.external) {
    return (
      <a
        href={tab.href}
        target="_blank"
        rel="noopener noreferrer"
        className={primaryClass}
      >
        {tab.cta}
      </a>
    );
  }

  if (tab.href?.startsWith("#")) {
    return (
      <button type="button" className={primaryClass} disabled>
        {tab.cta}
      </button>
    );
  }

  return (
    <Link href={tab.href} className={primaryClass}>
      {tab.cta}
    </Link>
  );
}

function CollaborateSecondaryCta({ tab }: { tab: CmsCollaborateTab }) {
  const secondary = tab.secondary;
  if (!secondary?.label) return null;

  const className =
    "inline-flex justify-center rounded-full border border-na-heket/25 px-5 py-2.5 text-sm font-bold text-na-heketDark transition hover:border-na-heket/40 hover:bg-na-heket/[0.06]";

  if (secondary.external) {
    return (
      <a
        href={secondary.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {secondary.label}
      </a>
    );
  }

  if (isEsferaSolicitudHref(secondary.href)) {
    return (
      <SolicitudEsferaDialog
        triggerLabel={secondary.label}
        triggerClassName={className}
      />
    );
  }

  return (
    <Link href={secondary.href} className={className}>
      {secondary.label}
    </Link>
  );
}
