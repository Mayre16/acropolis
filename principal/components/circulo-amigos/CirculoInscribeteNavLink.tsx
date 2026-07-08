"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CIRCULO_INSCRIPCION_HREF } from "@/lib/circulo-amigos-content";
import { dispatchCirculoInscripcionOpen } from "@/components/circulo-amigos/CirculoInscripcionProvider";
import { isCirculoHomePath } from "@/lib/circulo-inscribete-nav";

type CirculoInscribeteNavLinkProps = {
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
};

/** Inscríbete — abre el formulario de inscripción (o navega a home + #inscribete). */
export function CirculoInscribeteNavLink({
  className,
  children,
  onNavigate,
}: CirculoInscribeteNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate?.();

    if (isCirculoHomePath(pathname)) {
      dispatchCirculoInscripcionOpen();
      return;
    }

    router.push(CIRCULO_INSCRIPCION_HREF);
  };

  return (
    <a href={CIRCULO_INSCRIPCION_HREF} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
