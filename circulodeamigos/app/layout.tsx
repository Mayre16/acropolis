import { Suspense } from "react";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import "./circulo.css";
import { CirculoSiteChrome } from "@/components/CirculoSiteChrome";
import { CirculoFooter } from "@/components/CirculoFooter";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CmsEditModeBootstrap } from "@/components/cms/CmsEditModeBootstrap";
import { CirculoAmigosCmsEditProvider } from "@/components/cms/CirculoAmigosCmsEditContext";
import { CmsProvider } from "@/lib/cms/provider";
import { SITE_URL } from "@/lib/site-config";
import { assetUrl } from "@/lib/asset-url";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Círculo de Amigos OINADOM — Nueva Acrópolis República Dominicana",
    template: "%s | Círculo de Amigos OINADOM",
  },
  description:
    "Espacio abierto para quienes valoran los principios de Nueva Acrópolis y desean participar en sus actividades sin integrarse como miembros regulares.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Círculo de Amigos OINADOM",
    description:
      "Tu camino hacia la sabiduría y el servicio comienza aquí — Nueva Acrópolis República Dominicana.",
    url: SITE_URL,
    siteName: "Círculo de Amigos OINADOM",
    locale: "es_DO",
    type: "website",
  },
  icons: {
    icon: [{ url: assetUrl("/brand/icon-na.webp"), type: "image/webp" }],
    shortcut: assetUrl("/brand/icon-na.webp"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.parent!==window){document.documentElement.classList.add("cms-edit-embedded")}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <CmsEditModeBootstrap />
        </Suspense>
        <CmsProvider>
          <Suspense fallback={null}>
            <CirculoAmigosCmsEditProvider>
              <CirculoSiteChrome>{children}</CirculoSiteChrome>
              <CirculoFooter />
            </CirculoAmigosCmsEditProvider>
          </Suspense>
        </CmsProvider>
      </body>
    </html>
  );
}
