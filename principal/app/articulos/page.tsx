import type { Metadata } from "next";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { ArticulosHero } from "@/components/cms/ArticulosHero";

import { EnLosMedios } from "@/components/EnLosMedios";

import { ArticulosListing } from "@/components/cms/ArticulosListing";
import { ArticulosPageShell } from "@/components/cms/ArticulosPageShell";



export const metadata: Metadata = {

  title: "Blog — Pensamientos filosóficos",

  description:

    "Blog de filosofía práctica de Nueva Acrópolis RD. Reflexiones e ideas de Oriente y Occidente para pensar mejor y vivir con sentido.",

  alternates: { canonical: "/articulos" },

};



export default function ArticulosPage() {
  return (
    <ArticulosPageShell>

      <ArticulosHero />



      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">

        <ArticulosListing />

      </section>



      <EnLosMedios />



      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">

        <div className="rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-10">

          <h2 className="text-balance text-2xl font-black text-white sm:text-3xl">

            ¿Quieres profundizar?

          </h2>

          <p className="mx-auto mt-3 max-w-xl text-white/85">

            Estas ideas cobran vida en nuestra Escuela de Filosofía. Conoce el

            Diplomado de Filosofía para la Vida.

          </p>

          <Link

            href="/filosofia"

            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"

          >

            Ir a la Escuela de Filosofía

            <ArrowUpRight className="h-4 w-4" />

          </Link>

        </div>

      </section>

    </ArticulosPageShell>
  );
}

