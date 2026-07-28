import Link from "next/link";
import Image from "next/image";
import { BookOpen, Drama, HeartHandshake, ArrowRight } from "lucide-react";

import { accentCardShell, accentTokens } from "@/lib/brand-accents";

const PILLARS = [
  {
    icon: BookOpen,
    title: "Filosofía",
    tagline: "¡Filosofía para despertar!",
    img: "/img/eventos/santiago.webp",
    imgAlt: "Charla del Diplomado de Filosofía para la Vida",
    text: "Una escuela de filosofía a la manera clásica: ideas prácticas para conocernos, pensar con criterio y vivir mejor.",
    href: "/filosofia",
    cta: "Conoce la Escuela",
  },
  {
    icon: Drama,
    title: "Cultura",
    tagline: "¡Cultura para perfeccionar!",
    img: "/img/cultura/talleres/teatro.webp",
    imgAlt: "Grupo de teatro de Nueva Acrópolis en escena",
    text: "Talleres de danza, coro y teatro, actividades para jóvenes, eventos y celebraciones que acercan el arte y el conocimiento.",
    href: "/cultura",
    cta: "Ver actividades",
  },
  {
    icon: HeartHandshake,
    title: "Voluntariado",
    tagline: "¡Voluntariado para unir!",
    img: "/img/eventos/feria-salud.webp",
    imgAlt: "Voluntarios de Nueva Acrópolis en una actividad comunitaria",
    text: "Acción social y ecológica: jornadas de plantación, acompañamiento a hogares de adultos mayores y labores con niños.",
    href: "/voluntariado",
    cta: "Súmate",
  },
];

export function Pillars() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
        Áreas de actuación
      </p>
      <h2 className="sr-only">Filosofía, Cultura y Voluntariado</h2>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, tagline, img, imgAlt, text, href, cta }, i) => {
          const a = accentTokens(i);
          return (
            <li
              key={title}
              className={`group flex flex-col p-7 ${accentCardShell(i)}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.iconWrap} ${a.icon}`}>
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-xl font-black text-na-heketDark">{title}</h3>
              <p className={`mt-2 text-sm font-bold ${a.link}`}>{tagline}</p>
              <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-na-heket/5">
                <Image
                  src={img}
                  alt={imgAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-na-muted">
                {text}
              </p>
              <Link
                href={href}
                className={`mt-3 inline-flex items-center gap-2 text-sm font-bold transition group-hover:gap-3 ${a.link}`}
              >
                {cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
