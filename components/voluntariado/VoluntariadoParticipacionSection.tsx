"use client";

import { VolunteerForm } from "@/components/VolunteerForm";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import {
  useVoluntariadoParticipacionDisplay,
  VOLUNTARIADO_PARTICIPACION_SECTION_ID,
} from "@/lib/cms/voluntariado-display";

export function VoluntariadoParticipacionSection() {
  const edit = useVoluntariadoCmsEdit();
  const section = useVoluntariadoParticipacionDisplay();

  return (
    <section
      id="participacion"
      className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16"
    >
      {edit?.ready ? (
        <div className="absolute right-4 top-0 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar participación"
            onClick={() =>
              edit.setSelectedId(VOLUNTARIADO_PARTICIPACION_SECTION_ID)
            }
          />
        </div>
      ) : null}

      <div className="rounded-[1.75rem] border border-na-heket/10 bg-gradient-to-br from-na-heket/[0.06] to-na-kefer/[0.06] p-8 text-center shadow-na-soft sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {section.eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {section.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-na-muted">{section.intro}</p>
        <div className="mt-7 flex justify-center">
          <VolunteerForm />
        </div>
      </div>
    </section>
  );
}
