import type { Metadata } from "next";
import {
  RelacionesHero,
  RelacionesPageBody,
} from "@/components/cms/RelacionesHero";
import { RelacionesPageShell } from "@/components/cms/RelacionesPageShell";

export const metadata: Metadata = {
  title: "Relaciones institucionales",
  description:
    "Nueva Acrópolis construye alianzas con instituciones públicas y privadas para sus proyectos de voluntariado, cultura y acción social. Estatus consultivo ECOSOC ante Naciones Unidas.",
  alternates: { canonical: "/relaciones-institucionales" },
};

export default function RelacionesInstitucionalesPage() {
  return (
    <RelacionesPageShell>
      <RelacionesHero />
      <RelacionesPageBody />
    </RelacionesPageShell>
  );
}
