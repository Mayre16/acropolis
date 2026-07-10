import Image from "next/image";

type CmsBrandHeaderProps = {
  subtitle?: string;
  /** Barra de página: logo pequeño + título al lado. */
  compact?: boolean;
};

export function CmsBrandHeader({ subtitle, compact }: CmsBrandHeaderProps) {
  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/brand/logo-nueva-acropolis-stacked.webp"
          alt="Nueva Acrópolis"
          width={2429}
          height={1113}
          className="h-9 w-auto shrink-0 sm:h-10"
          priority
        />
        <div className="min-w-0 border-l border-slate-200 pl-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Sistema de contenidos
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
              {subtitle}
            </p>
          ) : (
            <p className="mt-0.5 text-sm font-medium text-slate-700">
              Panel de edición
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src="/brand/logo-nueva-acropolis-stacked.webp"
        alt="Nueva Acrópolis"
        width={2429}
        height={1113}
        className="h-auto w-full max-w-[12rem] sm:max-w-[14rem]"
        priority
      />
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-teal">
        Sistema de contenidos
      </p>
      {subtitle ? (
        <p className="mt-2 max-w-md text-sm text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
}
