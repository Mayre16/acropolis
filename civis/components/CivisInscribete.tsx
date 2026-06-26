"use client";

import { SolicitudPropuestaForm } from "@/components/SolicitudPropuestaForm";

export function CivisInscribete() {
  return (
    <section className="border-b border-na-civis/10 bg-na-surface py-14 pb-20 sm:py-16 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
          Solicitud
        </p>
        <h1 className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl">
          Solicita unirte o crea tu taller a la medida
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
          Cuéntanos cuántas personas participarían, la duración que tienen en
          mente, si cuentan con salón propio y qué temas les interesan. Con esos
          datos prepararemos una propuesta personalizada para su organización.
        </p>
        <div className="mt-10">
          <SolicitudPropuestaForm />
        </div>
      </div>
    </section>
  );
}
