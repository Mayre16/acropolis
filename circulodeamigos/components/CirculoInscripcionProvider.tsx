"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CirculoAmigosInscriptionForm } from "@/components/CirculoAmigosInscriptionForm";

export const CIRCULO_OPEN_INSCRIPTION_EVENT = "circulo-amigos:open-inscription";

const CirculoInscripcionHostContext = createContext(false);

export function dispatchCirculoInscripcionOpen() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CIRCULO_OPEN_INSCRIPTION_EVENT));
}

export function useCirculoInscripcionHost() {
  return useContext(CirculoInscripcionHostContext);
}

/** @deprecated Usar dispatchCirculoInscripcionOpen o useCirculoInscripcionHost. */
export function useCirculoInscripcion() {
  const hasHost = useCirculoInscripcionHost();
  return hasHost ? { open: dispatchCirculoInscripcionOpen } : null;
}

/** Un solo modal de inscripción para header, hero, CTA y #inscribete. */
export function CirculoInscripcionProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  return (
    <CirculoInscripcionHostContext.Provider value={true}>
      {children}
      <CirculoAmigosInscriptionForm
        hideTrigger
        watchHash
        variant="landing"
        open={open}
        onOpenChange={handleOpenChange}
      />
    </CirculoInscripcionHostContext.Provider>
  );
}
