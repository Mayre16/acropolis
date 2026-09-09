import type { Metadata } from "next";
import { CirculoSubdomainRedirect } from "@/components/circulo-amigos/CirculoSubdomainRedirect";
import { PLATFORM_PRODUCTION_URLS } from "@/lib/site-config";

const CIRCULO_ORIGIN = PLATFORM_PRODUCTION_URLS.circulo.replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Quiénes somos — Círculo de Amigos",
  description:
    "Conoce el Círculo de Amigos OINADOM. Sitio oficial en el subdominio Círculo de Amigos.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${CIRCULO_ORIGIN}/quienes-somos/` },
};

export default function CirculoQuienesSomosRedirectPage() {
  return <CirculoSubdomainRedirect toPath="/quienes-somos/" />;
}
