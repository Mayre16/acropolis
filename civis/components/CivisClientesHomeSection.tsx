"use client";

import { CivisClientesLogoGrid } from "@/components/CivisClientesLogoGrid";
import { CivisEditPencil } from "@/components/cms/CmsEditFields";
import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";
import { useCivisQuienesPageCopy, useMergedClientes } from "@/lib/cms/hooks";

/** Logos de clientes y aliados — home, entre actividades recientes y salones. */
export function CivisClientesHomeSection() {
  const edit = useCivisCmsEdit();
  const copy = useCivisQuienesPageCopy();
  const clientes = useMergedClientes();
  const section = copy.clientes ?? {};

  if (clientes.length === 0) return null;

  return (
    <section
      id="clientes-confianza"
      className="relative scroll-mt-28 border-t border-na-civis/10 bg-white py-14 sm:py-16"
    >
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar sección clientes"
          onClick={() => edit.setSelectedId("__quienes-clientes-section__")}
          className="right-4 top-4"
        />
      ) : null}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
          {section.eyebrow ?? "Confianza"}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl">
          {section.title ?? "Quienes han confiado en nosotros"}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
          {section.lede ??
            "Hemos acompañado a empresas, instituciones y organizaciones que buscan fortalecer a sus equipos con formación en convivencia, liderazgo y ética aplicada."}
        </p>

        <CivisClientesLogoGrid
          clientes={clientes}
          compact
          onEditCliente={
            edit?.ready
              ? (id) => edit.setSelectedId(`cliente:${id}`)
              : undefined
          }
        />
      </div>
    </section>
  );
}
