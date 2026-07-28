import type { Metadata } from "next";
import {
  QuienesSomosPageContent,
  quienesSomosMetadata,
} from "@/components/quienes-somos/QuienesSomosPageContent";

export const metadata: Metadata = quienesSomosMetadata("anuario");

export default function AnuarioPage() {
  return <QuienesSomosPageContent initialSection="anuario" />;
}
