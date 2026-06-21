import { Suspense } from "react";
import type { Metadata } from "next";
import { assetUrl } from "@/lib/asset-url";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { CivisSiteHeader } from "@/components/CivisSiteHeader";
import { CivisLegacyHashRedirect } from "@/components/CivisLegacyHashRedirect";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CmsEditModeBootstrap } from "@/components/cms/CmsEditModeBootstrap";
import { CivisCmsEditProvider } from "@/components/cms/CivisCmsEditContext";
import { CmsProvider } from "@/lib/cms/provider";
import { SITE_URL } from "@/lib/site-config";

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
    default: "Civis Consulting — Nueva Acrópolis República Dominicana",
    template: "%s | Civis Consulting",
  },
  description:
    "Civis Consulting de Nueva Acrópolis RD: talleres para empresas y equipos sobre comunicación, convivencia y liderazgo.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Civis Consulting — Nueva Acrópolis República Dominicana",
    description:
      "Talleres para empresas y equipos sobre comunicación, convivencia y liderazgo.",
    url: SITE_URL,
    siteName: "Civis Consulting",
    locale: "es_DO",
    type: "website",
  },
  icons: { icon: [{ url: assetUrl("/brand/icon-na.webp"), type: "image/webp" }] },
  ...(gscVerification
    ? { verification: { google: gscVerification } }
    : undefined),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <CmsEditModeBootstrap />
        </Suspense>
        <CmsProvider>
          <Suspense fallback={null}>
            <CivisCmsEditProvider>
              <CivisLegacyHashRedirect />
              <CivisSiteHeader />
              <main className="flex-1">{children}</main>
            </CivisCmsEditProvider>
          </Suspense>
        </CmsProvider>
      </body>
    </html>
  );
}
