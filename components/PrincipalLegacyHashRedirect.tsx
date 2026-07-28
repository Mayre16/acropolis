"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { legacyInstitutionalHashPath } from "@/lib/institucional-paths";

/** Redirige anclas legacy en /quienes-somos (#que-es, #principios…) a rutas limpias. */
export function PrincipalLegacyHashRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const next = legacyInstitutionalHashPath(hash, pathname);
    if (!next) return;
    router.replace(next);
  }, [pathname, router]);

  return null;
}
