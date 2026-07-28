import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata();

export default function QuienesSomosPage() {
  return <QuienesSomosPageContent initialSection="que-es" />;
}
