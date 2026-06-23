import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  HeartHandshake,
  Siren,
  GraduationCap,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

type Section = {
  icon: typeof BookOpen;
  title: string;
  text: string;
  href: string;
};

const SECTIONS: Section[] = [
  {
    icon: BookOpen,
    title: "Filosofía",
    text: "Escuela de filosofía a la manera clásica y el Diplomado Filosofía para la Vida.",
    href: "/filosofia",
  },
  {
    icon: Sparkles,
    title: "Cultura",
    text: "Talleres de arte, viajes culturales, eventos por estación y celebraciones en nuestras sedes.",
    href: "/cultura",
  },
  {
    icon: HeartHandshake,
    title: "Voluntariado",
    text: "Ecología, acompañamiento a mayores y actividades con niños. Todos somos voluntarios.",
    href: "/voluntariado",
  },
  {
    icon: Siren,
    title: "Punto Focal Esfera",
    text: "Formación humanitaria y preparación ante desastres con base en el Manual Esfera.",
    href: "/esfera",
  },
  {
    icon: CalendarDays,
    title: "Eventos",
    text: "Encuentros, celebraciones y noticias fuera de las clases y programas regulares.",
    href: "/eventos",
  },
  {
    icon: GraduationCap,
    title: "Cursos",
    text: "El arte de respirar, pintura, Tai Chi, círculo de lectura, bienestar y más.",
    href: "/cursos",
  },
];

function CardInner({ s, index }: { s: Section; index: number }) {
  const Icon = s.icon;
  const a = accentTokens(index);
  return (
    <>
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.iconWrap} ${a.icon}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </div>
        <ArrowRight
          className={`h-5 w-5 transition group-hover:translate-x-1 ${a.link}`}
        />
      </div>
      <h3 className="mt-4 text-lg font-black text-na-heketDark">{s.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-na-muted">{s.text}</p>
    </>
  );
}

export function ExploreSections() {
  return (
    <section className="border-t border-na-heket/10 bg-na-heket/[0.04] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-amon">
          Explora
        </p>
        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Todo lo que ofrecemos
        </h2>
        <p className="mt-3 max-w-2xl text-na-muted">
          Conoce nuestras áreas y proyectos. Cada espacio tiene su propia página
          con detalles, horarios y formas de participar.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s, i) => {
            const cardClass = `${accentCardShell(i)} group p-6`;
            return (
              <Link key={s.title} href={s.href} className={cardClass}>
                <CardInner s={s} index={i} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
