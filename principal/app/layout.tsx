import { Suspense } from "react";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteAnalytics } from "@/components/SiteAnalytics";
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
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://editor.acropolis.adesa.com.do"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://editor.acropolis.adesa.com.do" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var inFrame=window.parent!==window;if(inFrame){document.documentElement.classList.add("cms-edit-embedded")}var q=location.search;if(/[?&]cmsEdit=(?:1|medios)(?:&|$)/.test(q)||(inFrame&&sessionStorage.getItem("acropolis-cms-edit"))){document.documentElement.classList.add("cms-edit-pending-hero")}}catch(e){}try{var api=${JSON.stringify(
              process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "") || "",
            )};if(!api)return;var origin=api.replace(/\\/api$/i,"");var u=api+"/content/acropolis/published";var slot=window.__acropolisCmsPublished=window.__acropolisCmsPublished||{};if(slot.promise)return;slot.promise=fetch(u,{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(d){slot.doc=d;try{var src=d&&d.sections&&d.sections.homeHero&&d.sections.homeHero.background&&d.sections.homeHero.background.src;if(src&&src.indexOf("/uploads/")!==-1){var href=src.indexOf("http")===0?src:(origin+src);var l=document.createElement("link");l.rel="preload";l.as="image";l.href=href;document.head.appendChild(l)}}catch(e){}return d}).catch(function(){return null})}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <SiteAnalytics site="acropolis" />
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
