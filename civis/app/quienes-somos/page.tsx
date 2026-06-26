import { Suspense } from "react";

import { CivisQuienesSomos } from "@/components/CivisQuienesSomos";
import { CivisPageShell } from "@/components/cms/CivisPageShell";

export default function QuienesSomosPage() {
  return (
    <CivisPageShell pageId="quienes-somos">
      <Suspense fallback={null}>
        <CivisQuienesSomos />
      </Suspense>
    </CivisPageShell>
  );
}
