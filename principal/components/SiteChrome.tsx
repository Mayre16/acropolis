"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PlatformNavBar } from "@/components/PlatformNavBar";
import { PrincipalLegacyHashRedirect } from "@/components/PrincipalLegacyHashRedirect";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrincipalLegacyHashRedirect />
      <PlatformNavBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
