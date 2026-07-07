import type { Metadata } from "next";
import { CirculoQuienesSomos } from "@/components/CirculoQuienesSomos";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Conoce el Círculo de Amigos OINADOM y su vínculo con Nueva Acrópolis en República Dominicana.",
};

export default function QuienesSomosPage() {
  return <CirculoQuienesSomos />;
}
