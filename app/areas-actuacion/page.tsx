import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("areas-actuacion");

export default function AreasActuacionPage() {
  return <QuienesSomosPageContent initialSection="areas-actuacion" />;
}
