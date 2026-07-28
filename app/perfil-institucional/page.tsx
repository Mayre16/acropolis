import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("perfil-institucional");

export default function PerfilInstitucionalPage() {
  return <QuienesSomosPageContent initialSection="perfil-institucional" />;
}
