import type { Metadata } from "next";
import { WhereWeAre } from "@/components/home/WhereWeAre";
import { VenuesPageShell } from "@/components/cms/VenuesPageShell";

export const metadata: Metadata = {
  title: "Dónde estamos",
  description:
    "Sedes en Naco, Los Prados y Roberto Pastoriza (Santo Domingo) y Santiago. Direcciones, mapa y contacto de Nueva Acrópolis República Dominicana.",
  alternates: { canonical: "/donde-estamos" },
};

export default function DondeEstamosPage() {
  return (
    <VenuesPageShell>
      <div className="bg-na-surface">
        <WhereWeAre />
      </div>
    </VenuesPageShell>
  );
}
