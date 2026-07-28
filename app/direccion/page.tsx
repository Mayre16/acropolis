import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("direccion-nacional");

export default function DireccionPage() {
  return <QuienesSomosPageContent initialSection="direccion-nacional" />;
}
