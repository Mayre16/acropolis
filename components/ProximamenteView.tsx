import Link from "next/link";
import {
  PROXIMAMENTE_SITES,
  type ProximamenteSite,
} from "@/lib/proximamente";

type Props = {
  site?: ProximamenteSite;
  /** Página genérica 404 / no encontrada */
  notFound?: boolean;
};

export function ProximamenteView({ site, notFound = false }: Props) {
  const title = notFound
    ? "Página no disponible"
    : site
      ? `${site.label} — Próximamente`
      : "Próximamente";

  const lede = notFound
    ? "Esta ruta no existe o aún no está publicada. Puedes volver al inicio o explorar las plataformas en preparación."
    : site
      ? site.blurb
      : "Estamos preparando los sitios de Civis, Librería, Biblioteca y más en los dominios de acropolis.org.do.";

  return (
    <section className="relative flex flex-1 flex-col bg-[#eef0f2]">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Nueva Acrópolis RD
        </p>
        <h1 className="mt-4 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-na-ink/80 sm:text-lg">
          {lede}
        </p>

        {site ? (
          <p className="mt-6 rounded border border-na-heket/15 bg-white/70 px-4 py-3 text-sm text-na-heketDark">
            Dominio previsto:{" "}
            <span className="font-semibold">{site.domain}</span>
          </p>
        ) : null}

        {!site && !notFound ? (
          <ul className="mt-10 space-y-3">
            {PROXIMAMENTE_SITES.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/proximamente/${s.id}`}
                  className="group flex flex-col rounded border border-na-heket/10 bg-white/80 px-4 py-3 transition hover:border-na-heket/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-na-heketDark group-hover:text-na-kefer">
                    {s.label}
                  </span>
                  <span className="text-sm text-na-ink/60">{s.domain}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded border-2 border-na-heket bg-na-heket px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-na-heketDark"
          >
            Ir al inicio
          </Link>
          <Link
            href="/contenido"
            className="inline-flex items-center justify-center rounded border-2 border-na-heket px-6 py-3 text-xs font-bold uppercase tracking-wider text-na-heket transition hover:bg-na-heket hover:text-white"
          >
            Contenido digital
          </Link>
          {!notFound && site ? (
            <Link
              href="/proximamente"
              className="inline-flex items-center justify-center px-2 py-3 text-xs font-bold uppercase tracking-wider text-na-kefer underline-offset-4 hover:underline"
            >
              Ver todas
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
