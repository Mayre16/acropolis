import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("principios");

export default function PrincipiosPage() {
  return <QuienesSomosPageContent initialSection="principios" />;
}
