import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("fundacion-organizacion");

export default function OrganizacionPage() {
  return (
    <QuienesSomosPageContent initialSection="fundacion-organizacion" />
  );
}
