"use client";

import { Mail, MapPin, Pencil } from "lucide-react";
import { usePrimarySedeContact } from "@/lib/cms/hooks";
import { useVenuesCmsEdit } from "@/components/cms/VenuesCmsEditContext";
import { VOLUNTARIADO_EMAIL } from "@/lib/site-config";

export function EsferaContactInfo() {
  const contacto = usePrimarySedeContact();
  const edit = useVenuesCmsEdit();
  const mailtoHref = `mailto:${VOLUNTARIADO_EMAIL}`;

  const openEdit = () => {
    const naco = edit?.items.find((v) => v.id === "sede-naco");
    const first = naco ?? edit?.items.find((v) => v.kind === "sede");
    if (first) edit?.setSelectedId(first.id);
  };

  return (
    <div className="relative">
      {edit?.ready ? (
        <button
          type="button"
          onClick={openEdit}
          className="absolute -right-1 -top-1 z-10 rounded-full bg-na-helios p-2 text-na-ink shadow"
          aria-label="Editar dirección de contacto"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <div className="mt-8 space-y-4 text-sm text-na-muted">
        <p className="inline-flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-na-kefer" aria-hidden />
          {contacto.direccion}, {contacto.ciudad}
        </p>
        <p>
          <a
            href={mailtoHref}
            className="inline-flex items-center justify-center gap-2 font-medium text-na-heket transition hover:text-na-kefer"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            {VOLUNTARIADO_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
