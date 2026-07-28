import type { Metadata } from "next";
import { DiplomadoLanding } from "@/components/diplomado/DiplomadoLanding";

export const metadata: Metadata = {
  title: "Diplomado Filosofía para la Vida",
  description:
    "Inscripción al Diplomado Filosofía para la Vida — lunes 3 de agosto, 7:00 a 9:15 p.m., presencial. Nueva Acrópolis República Dominicana.",
  alternates: { canonical: "/diplomado" },
};

export default function DiplomadoPage() {
  return <DiplomadoLanding />;
}
