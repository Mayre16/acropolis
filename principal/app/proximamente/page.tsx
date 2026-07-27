import type { Metadata } from "next";
import { ProximamenteView } from "@/components/ProximamenteView";

export const metadata: Metadata = {
  title: "Próximamente",
  description:
    "Sitios de Civis, Librería, Biblioteca y Círculo de Amigos en dominios acropolis.org.do — en preparación.",
  robots: { index: false, follow: true },
};

export default function ProximamenteIndexPage() {
  return <ProximamenteView />;
}
