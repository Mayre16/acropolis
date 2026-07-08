"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PlatformNavBar } from "@/components/PlatformNavBar";
import { PrincipalLegacyHashRedirect } from "@/components/PrincipalLegacyHashRedirect";
import { CirculoSiteHeader } from "@/components/circulo-amigos/CirculoSiteHeader";
import { CirculoFooter } from "@/components/circulo-amigos/CirculoFooter";
import { CirculoInscripcionProvider } from "@/components/circulo-amigos/CirculoInscripcionProvider";
import { CIRCULO_AMIGOS_PATH } from "@/lib/circulo-amigos-content";

function isCirculoRoute(pathname: string) {
  return (
    pathname === CIRCULO_AMIGOS_PATH ||
    pathname.startsWith(`${CIRCULO_AMIGOS_PATH}/`)
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const circulo = isCirculoRoute(pathname);

  return (
    <>
      <PrincipalLegacyHashRedirect />
      {circulo ? (
        <CirculoInscripcionProvider>
          <CirculoSiteHeader />
          <div className="h-2 shrink-0 bg-white sm:h-3" aria-hidden="true" />
          <main className="flex-1">{children}</main>
          <CirculoFooter />
        </CirculoInscripcionProvider>
      ) : (
        <>
          <div className="sticky top-0 z-50">
            <PlatformNavBar />
            <Header />
          </div>
          <main className="flex-1">{children}</main>
          <Footer />
        </>
      )}
    </>
  );
}
