import { Suspense } from "react";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CmsProvider } from "@/lib/cms/provider";
import { CmsEditModeBootstrap } from "@/components/cms/CmsEditModeBootstrap";
import { SITE_URL } from "@/lib/site-config";
import { assetUrl } from "@/lib/asset-url";
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Nueva Acrópolis República Dominicana — Filosofía, Cultura y Voluntariado",
    template: "%s | Nueva Acrópolis República Dominicana",
  },
  description:
    "Organización Internacional Nueva Acrópolis en República Dominicana. Escuela de filosofía a la manera clásica, actividades culturales y voluntariado. Sedes en Naco y Los Prados (Santo Domingo); Punto Cultural Roberto Pastoriza.",
  keywords: [
    "Nueva Acrópolis",
    "Nueva Acrópolis República Dominicana",
    "escuela de filosofía",
    "filosofía para la vida",
    "voluntariado",
    "cultura",
    "Santo Domingo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Nueva Acrópolis República Dominicana",
    description:
      "Filosofía, Cultura y Voluntariado al servicio del desarrollo del ser humano.",
    url: SITE_URL,
    siteName: "Nueva Acrópolis República Dominicana",
    locale: "es_DO",
    type: "website",
  },
  icons: {
    icon: [{ url: assetUrl("/brand/icon-na.webp"), type: "image/webp" }],
  },
  ...(gscVerification
    ? { verification: { google: gscVerification } }
    : undefined),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var q=location.search;if(/[?&]cmsEdit=(?:1|medios)(?:&|$)/.test(q)||(window.parent!==window&&sessionStorage.getItem("acropolis-cms-edit"))){document.documentElement.classList.add("cms-edit-pending-hero")}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <Suspense fallback={null}>
          <CmsEditModeBootstrap />
        </Suspense>
        <CmsProvider>
          <SiteChrome>{children}</SiteChrome>
        </CmsProvider>
      </body>
    </html>
  );
}
