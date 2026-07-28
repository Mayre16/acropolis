"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markEsferaSolicitudOpen } from "@/components/EsferaSolicitudAutoOpen";

export default function EsferaSolicitudRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    markEsferaSolicitudOpen();
    router.replace("/esfera/");
  }, [router]);

  return (
    <p className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-na-muted">
      Abriendo formulario de solicitud…
    </p>
  );
}
