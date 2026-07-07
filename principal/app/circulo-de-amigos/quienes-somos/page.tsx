import type { Metadata } from "next";
import { CirculoQuienesSomos } from "@/components/circulo-amigos/CirculoQuienesSomos";
import { CirculoAmigosPageShell } from "@/components/cms/CirculoAmigosPageShell";
import { CirculoAmigosShell } from "@/components/circulo-amigos/CirculoAmigosShell";
import { CIRCULO_QUIENES_SOMOS_PATH } from "@/lib/circulo-amigos-content";

export const metadata: Metadata = {
  title: "Quiénes somos — Círculo de Amigos",
  description:
    "Conoce el Círculo de Amigos OINADOM y su vínculo con Nueva Acrópolis en República Dominicana.",
  alternates: { canonical: CIRCULO_QUIENES_SOMOS_PATH },
};

export default function CirculoQuienesSomosPage() {
  return (
    <CirculoAmigosShell>
      <CirculoAmigosPageShell>
        <CirculoQuienesSomos />
      </CirculoAmigosPageShell>
    </CirculoAmigosShell>
  );
}
