"use client";

import { CivisMediaImage } from "@/components/cms/CivisMediaImage";
import { CivisEditPencil } from "@/components/cms/CmsEditFields";

export type CivisClienteLogoItem = {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  logoOnDark?: boolean;
};

type CivisClientesLogoGridProps = {
  clientes: CivisClienteLogoItem[];
  onEditCliente?: (id: string) => void;
  compact?: boolean;
};

export function CivisClientesLogoGrid({
  clientes,
  onEditCliente,
  compact = false,
}: CivisClientesLogoGridProps) {
  return (
    <ul
      className={
        compact
          ? "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          : "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {clientes.map((cliente) => (
        <li
          key={cliente.id}
          className="relative flex flex-col items-center justify-between gap-3 rounded-2xl border border-na-civis/12 bg-na-civis/[0.04] p-4 text-center shadow-na-soft sm:gap-4 sm:p-5"
        >
          {onEditCliente ? (
            <CivisEditPencil
              label={`Editar ${cliente.name}`}
              onClick={() => onEditCliente(cliente.id)}
            />
          ) : null}
          <div
            className={`flex min-h-[64px] w-full flex-1 items-center justify-center rounded-xl px-3 py-3 sm:min-h-[72px] sm:py-4 ${
              cliente.logoOnDark
                ? "bg-na-civisDark"
                : "bg-white/90 shadow-na-soft"
            }`}
          >
            {cliente.logo ? (
              <CivisMediaImage
                src={cliente.logo}
                alt={cliente.logoAlt}
                width={180}
                height={72}
                className="max-h-14 w-auto max-w-full object-contain sm:max-h-16"
              />
            ) : (
              <span className="text-xs text-na-muted">Sin logo</span>
            )}
          </div>
          <p className="text-[11px] font-bold leading-snug text-na-civisDark sm:text-xs">
            {cliente.name}
          </p>
        </li>
      ))}
    </ul>
  );
}
