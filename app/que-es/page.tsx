import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("que-es");

export default function QueEsPage() {
  return <QuienesSomosPageContent initialSection="que-es" />;
}
