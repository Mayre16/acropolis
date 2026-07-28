"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useViajesCmsEdit } from "@/components/cms/ViajesCmsEditContext";
import { useViajeCategoriaDisplay } from "@/lib/cms/viajes-display";
import {
  VIAJE_CATEGORIAS,
  type ViajeCategoriaSlug,
} from "@/lib/viajes";

type Props = {
  categoria: ViajeCategoriaSlug;
};

export function ViajesCategoriaHero({ categoria }: Props) {
  const cat = VIAJE_CATEGORIAS[categoria];
  const edit = useViajesCmsEdit();
  const display = useViajeCategoriaDisplay(categoria);

  return (
    <CmsPageHero
      id={`viajes-${categoria}-hero`}
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[
        { label: "Inicio", href: "/" },
        { label: "Cultura", href: "/cultura/" },
        { label: cat.title },
      ]}
      images={[{ src: display.heroImage.src, alt: display.heroImage.alt }]}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedKey("__hero__")}
    />
  );
}