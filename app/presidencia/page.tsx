import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("presidencia");

export default function PresidenciaPage() {
  return <QuienesSomosPageContent initialSection="presidencia" />;
}
