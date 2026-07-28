import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("simbolismo");

export default function SimbolismoPage() {
  return <QuienesSomosPageContent initialSection="simbolismo" />;
}
