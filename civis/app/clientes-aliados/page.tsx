import type { Metadata } from "next";
import { CivisClientesAliadosSection } from "@/components/CivisQuienesSomos";
import { CivisPageShell } from "@/components/cms/CivisPageShell";
import { CIVIS_CLIENTES_ALIADOS_PATH } from "@/lib/civis-content";

export const metadata: Metadata = {
  title: "Clientes y aliados",
  alternates: { canonical: CIVIS_CLIENTES_ALIADOS_PATH },
};

export default function ClientesAliadosPage() {
  return (
    <CivisPageShell pageId="clientes-aliados">
      <CivisClientesAliadosSection />
    </CivisPageShell>
  );
}
