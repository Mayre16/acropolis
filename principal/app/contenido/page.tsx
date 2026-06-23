import type { Metadata } from "next";
import { ContenidoHub } from "@/components/contenido/ContenidoHub";
import { InstagramFeedSection } from "@/components/home/InstagramFeedSection";
import {
  CONTENIDO_HUB_LEDE,
  getContenidoHubSlides,
} from "@/lib/contenido-content";

export const metadata: Metadata = {
  title: "Contenido digital",
  description:
    "Artículos, eventos, agenda, cursos recurrentes, talleres, Revista Esfinge, biblioteca y librería de Nueva Acrópolis República Dominicana.",
};

export default function ContenidoPage() {
  const slides = getContenidoHubSlides();

  return (
    <>
      <ContenidoHub slides={slides} lede={CONTENIDO_HUB_LEDE} />
      <InstagramFeedSection />
    </>
  );
}
