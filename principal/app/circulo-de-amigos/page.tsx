import type { Metadata } from "next";
import { CirculoAmigosLanding } from "@/components/circulo-amigos/CirculoAmigosLanding";
import { CirculoAmigosShell } from "@/components/circulo-amigos/CirculoAmigosShell";
import { CIRCULO_AMIGOS_PATH } from "@/lib/circulo-amigos-content";

export const metadata: Metadata = {
  title: "Círculo de Amigos OINADOM",
  description:
    "Espacio abierto para quienes valoran los principios de Nueva Acrópolis y desean participar en sus actividades sin integrarse como miembros regulares.",
  alternates: { canonical: CIRCULO_AMIGOS_PATH },
};

export default function CirculoDeAmigosPage() {
  return (
    <CirculoAmigosShell>
      <CirculoAmigosLanding />
    </CirculoAmigosShell>
  );
}
