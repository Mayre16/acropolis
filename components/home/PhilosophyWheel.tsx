"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";

type AreaKey = "filosofia" | "cultura" | "voluntariado";

const AREAS: Record<
  AreaKey,
  { name: string; color: string; shades: [string, string] }
> = {
  filosofia: { name: "Filosofía", color: "#086357", shades: ["#086357", "#0a7a6b"] },
  cultura: { name: "Cultura", color: "#009485", shades: ["#009485", "#03a597"] },
  voluntariado: { name: "Voluntariado", color: "#f39300", shades: ["#e08600", "#f39300"] },
};

type Facet = { area: AreaKey; short: string; title: string; desc: string };

const FACETS: Facet[] = [
  {
    area: "voluntariado",
    short: "Resolver",
    title: "Buscar soluciones a problemas prácticos",
    desc: "Llevar la filosofía a la vida real, aportando respuestas concretas a las necesidades de la comunidad.",
  },
  {
    area: "voluntariado",
    short: "Aliarnos",
    title: "Aliarnos para lograr los cambios",
    desc: "Sumar esfuerzos con otras personas e instituciones para transformar la realidad de forma positiva.",
  },
  {
    area: "voluntariado",
    short: "Aprender",
    title: "Aprender para ayudar con eficacia",
    desc: "Formarnos y prepararnos para que nuestra ayuda sea realmente útil y sostenible en el tiempo.",
  },
  {
    area: "voluntariado",
    short: "Empatía",
    title: "Ponernos en el lugar de los demás",
    desc: "Cultivar la empatía y la fraternidad como base de toda acción solidaria.",
  },
  {
    area: "filosofia",
    short: "Relacionar",
    title: "Relacionar conocimientos",
    desc: "Unir las ideas de las ciencias, las artes y las tradiciones para comprender la vida de forma integral.",
  },
  {
    area: "filosofia",
    short: "Crear",
    title: "Promover la creatividad",
    desc: "Despertar la capacidad de imaginar, crear y aportar respuestas nuevas a las preguntas de siempre.",
  },
  {
    area: "filosofia",
    short: "Conocernos",
    title: "Conocernos en la acción desinteresada",
    desc: "Descubrir quiénes somos al actuar por los demás sin esperar nada a cambio.",
  },
  {
    area: "filosofia",
    short: "Dar lo\nmejor",
    title: "Dar lo mejor de nosotros",
    desc: "Hacer de la mejora interior un hábito y sacar a la luz nuestras mejores cualidades.",
  },
  {
    area: "cultura",
    short: "Cultivar",
    title: "Cultivar lo mejor del ingenio humano",
    desc: "Apreciar y mantener vivas las grandes obras del arte, la ciencia y el pensamiento.",
  },
  {
    area: "cultura",
    short: "Atesorar",
    title: "Atesorar el patrimonio civilizatorio",
    desc: "Cuidar la herencia de las civilizaciones como un tesoro que nos pertenece a todos.",
  },
  {
    area: "cultura",
    short: "Expresar",
    title: "Valorar la cultura como expresión del alma",
    desc: "Entender el arte y la cultura como el lenguaje con que el ser humano expresa lo más profundo de sí.",
  },
  {
    area: "cultura",
    short: "Armonía",
    title: "Actuar en armonía",
    desc: "Buscar el equilibrio entre pensar, sentir y hacer, y con la naturaleza que nos rodea.",
  },
];

const N = FACETS.length;
const SEG = 360 / N;
const C = 220;
const R_OUT = 212;
const R_IN = 116;
const LABEL_R = (R_OUT + R_IN) / 2;
const SPIN_TRANSITION = "transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1)";

function polar(r: number, aDeg: number) {
  const a = (aDeg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

function sectorPath(i: number) {
  const start = i * SEG - SEG / 2;
  const end = i * SEG + SEG / 2;
  const p1 = polar(R_OUT, start);
  const p2 = polar(R_OUT, end);
  const p3 = polar(R_IN, end);
  const p4 = polar(R_IN, start);
  return `M ${p1.x} ${p1.y} A ${R_OUT} ${R_OUT} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${R_IN} ${R_IN} 0 0 0 ${p4.x} ${p4.y} Z`;
}

export type PhilosophyWheelProps = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
  /** Sin envoltorio de sección (p. ej. modal) */
  bare?: boolean;
  /** Layout más compacto para popup */
  compact?: boolean;
  className?: string;
  showHeader?: boolean;
};

export function PhilosophyWheel({
  eyebrow = "Filosofía viva",
  heading = "¿Qué es Filosofía?",
  lede = "Para nosotros la filosofía es una forma de vivir. Gira la rueda o toca cada parte para descubrir un significado de la filosofía vivida.",
  bare = false,
  compact = false,
  className = "",
  showHeader = true,
}: PhilosophyWheelProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const active = selected !== null ? FACETS[selected] : null;
  const activeArea = active ? AREAS[active.area] : AREAS.filosofia;

  function goTo(i: number, spin = false) {
    const target = -i * SEG;
    setRotation((prev) => {
      let diff = (((target - prev) % 360) + 540) % 360 - 180;
      if (spin) diff += 360;
      return prev + diff;
    });
    setSelected(i);
  }

  function spinRandom() {
    let j = Math.floor(Math.random() * N);
    if (j === selected) j = (j + 1) % N;
    goTo(j, true);
  }

  const wheelMax = compact ? "max-w-[20rem]" : "max-w-[26rem]";
  const gridClass = compact
    ? "mt-8 grid items-start gap-8"
    : "mt-12 grid items-center gap-10 lg:grid-cols-2";

  const inner = (
    <>
      {showHeader ? (
        <div className={compact ? "text-left" : "text-center"}>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            {eyebrow}
          </p>
          <h2
            className={`mt-3 text-balance font-black text-na-heketDark ${
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
            }`}
          >
            {heading}
          </h2>
          <p
            className={`mt-4 leading-relaxed text-na-muted ${
              compact ? "max-w-none text-sm sm:text-base" : "mx-auto max-w-2xl"
            }`}
          >
            {lede}
          </p>
        </div>
      ) : null}

      <div className={gridClass}>
        <div className="flex flex-col items-center">
          <div
            className={`relative aspect-square w-full overflow-visible ${wheelMax}`}
          >
            <svg
              viewBox="0 0 440 440"
              className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
              aria-hidden
            >
              <polygon
                points={`${C - 12},6 ${C + 12},6 ${C},26`}
                fill="#086357"
              />
            </svg>

            <div
              className="absolute inset-0 origin-center overflow-visible"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: SPIN_TRANSITION,
              }}
            >
              <svg
                viewBox="0 0 440 440"
                className="h-full w-full overflow-visible"
                role="group"
                aria-label="Segmentos del círculo de la filosofía"
              >
                {FACETS.map((f, i) => {
                  const area = AREAS[f.area];
                  const isSel = selected === i;
                  const fill = area.shades[i % 2];
                  return (
                    <path
                      key={i}
                      d={sectorPath(i)}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={isSel ? 4 : 2}
                      opacity={selected === null || isSel ? 1 : 0.82}
                      style={{ cursor: "pointer", transition: "opacity 0.3s" }}
                      onClick={() => goTo(i)}
                      role="button"
                      tabIndex={0}
                      aria-label={f.title}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goTo(i);
                        }
                      }}
                    />
                  );
                })}
              </svg>

              {FACETS.map((f, i) => {
                const pos = polar(LABEL_R, i * SEG);
                const multiLine = f.short.includes("\n");
                const longLabel = multiLine || f.short.length > 8;
                return (
                  <span
                    key={`label-${i}`}
                    className={`pointer-events-none absolute select-none text-center font-bold leading-[1.15] text-white ${
                      multiLine ? "whitespace-pre-line" : ""
                    } ${
                      longLabel
                        ? "text-[10px] sm:text-[11px] md:text-xs"
                        : "text-xs sm:text-sm"
                    }`}
                    style={{
                      left: `${(pos.x / 440) * 100}%`,
                      top: `${(pos.y / 440) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                      transition: SPIN_TRANSITION,
                      width: longLabel ? "5.75rem" : "4.25rem",
                      maxWidth: "5.75rem",
                      overflow: "visible",
                    }}
                  >
                    {f.short}
                  </span>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex aspect-square w-[46%] flex-col items-center justify-center rounded-full bg-na-surface px-3 text-center shadow-na-soft sm:px-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: activeArea.color }}
                >
                  {active ? activeArea.name : "Filosofía"}
                </span>
                <span className="mt-1 whitespace-pre-line text-balance text-sm font-black leading-tight text-na-heketDark">
                  {active ? active.short : "Gira la rueda"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={spinRandom}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-na-soft transition hover:bg-na-heketDark"
          >
            <RotateCw className="h-4 w-4" />
            Girar la rueda
          </button>
        </div>

        <div>
          <div
            className={`rounded-[1.75rem] border border-na-heket/10 bg-na-surface shadow-na-soft ${
              compact ? "p-5 sm:p-6" : "p-7 sm:p-9"
            }`}
            aria-live="polite"
          >
            {active ? (
              <>
                <span
                  className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: activeArea.color }}
                >
                  {activeArea.name}
                </span>
                <h3
                  className={`mt-4 text-balance font-black leading-tight text-na-heketDark ${
                    compact ? "text-xl" : "text-2xl"
                  }`}
                >
                  {active.title}
                </h3>
                <p className="mt-3 leading-relaxed text-na-muted">{active.desc}</p>
                <p className="mt-5 text-sm font-semibold text-na-kefer">
                  Un significado de la filosofía vivida.
                </p>
              </>
            ) : (
              <>
                <h3
                  className={`text-balance font-black leading-tight text-na-heketDark ${
                    compact ? "text-xl" : "text-2xl"
                  }`}
                >
                  Doce significados, un mismo camino
                </h3>
                <p className="mt-3 leading-relaxed text-na-muted">
                  Cada parte de la rueda es una forma de vivir la filosofía:
                  conocer mejor el mundo, valorar la cultura y servir a los
                  demás. Pulsa «Girar la rueda» o toca un segmento para
                  descubrir tu mensaje.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap gap-4 border-t border-na-heket/10 pt-5">
              {(Object.keys(AREAS) as AreaKey[]).map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-na-muted"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: AREAS[k].color }}
                  />
                  {AREAS[k].name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (bare) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <section
      id="que-es-filosofia"
      className={`border-t border-na-heket/10 bg-na-heket/[0.04] py-16 sm:py-20 ${className}`.trim()}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{inner}</div>
    </section>
  );
}
