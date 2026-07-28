import Image from "next/image";
import { SIMBOLISMO_NOMBRE } from "@/lib/institucional-content";

const SIMBOLISMO_IMAGE = {
  src: "/img/home/grecia.webp",
  alt: "Visitante contemplando el Partenón en la Acrópolis de Atenas",
} as const;

export function SimbolismoSection() {
  const bodyParagraphs = SIMBOLISMO_NOMBRE.paragraphs.slice(0, -1);
  const caption = SIMBOLISMO_NOMBRE.paragraphs.at(-1) ?? "";

  return (
    <section
      id="simbolismo"
      className="scroll-mt-36 border-t border-na-heket/10 bg-na-sand/50 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Nuestro nombre
        </p>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
              <Image
                src={SIMBOLISMO_IMAGE.src}
                alt={SIMBOLISMO_IMAGE.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>
            {caption ? (
              <p className="mt-4 text-sm italic leading-relaxed text-na-muted">
                {caption}
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {SIMBOLISMO_NOMBRE.title}
            </h2>
            <div className="mt-6 space-y-4 text-na-muted">
              {bodyParagraphs.map((p) => (
                <p key={p.slice(0, 32)} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
