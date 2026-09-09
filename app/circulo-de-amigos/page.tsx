import type { Metadata } from "next";
import { CirculoSubdomainRedirect } from "@/components/circulo-amigos/CirculoSubdomainRedirect";
import { PLATFORM_PRODUCTION_URLS } from "@/lib/site-config";

const CIRCULO_ORIGIN = PLATFORM_PRODUCTION_URLS.circulo.replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Círculo de Amigos OINADOM",
  description:
    "Espacio abierto para quienes valoran los principios de Nueva Acrópolis. Sitio oficial en el subdominio Círculo de Amigos.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${CIRCULO_ORIGIN}/` },
};

/** La ruta en acropolis.org.do redirige al subdominio oficial. */
export default function CirculoDeAmigosRedirectPage() {
  return <CirculoSubdomainRedirect toPath="/" />;
}
