/** Párrafos del cuerpo (artículos con mini-títulos y notas al pie). */
export function ArticleBody({ paragraphs }: { paragraphs: string[] }) {
  const [lead, ...rest] = paragraphs;

  return (
    <>
      {lead ? (
        <p className="text-lg font-medium leading-relaxed text-na-heketDark">
          {lead}
        </p>
      ) : null}
      <div className={lead ? "mt-6 space-y-5" : "space-y-5"}>
        {rest.map((p, i) => {
          if (p === "Notas") {
            return (
              <h2
                key={i}
                className="mt-10 border-t border-na-heket/15 pt-6 text-sm font-bold uppercase tracking-[0.2em] text-na-kefer"
              >
                Notas
              </h2>
            );
          }
          const isFootnote = /^\[\d+\]/.test(p);
          const isMiniTitle = p.length < 60 && !/[.!?…]$/.test(p);
          if (isMiniTitle) {
            return (
              <h3
                key={i}
                className="pt-2 text-xl font-black text-na-heketDark"
              >
                {p}
              </h3>
            );
          }
          return (
            <p
              key={i}
              className={
                isFootnote
                  ? "text-sm leading-relaxed text-na-muted"
                  : "leading-relaxed text-na-ink/80"
              }
            >
              {p}
            </p>
          );
        })}
      </div>
    </>
  );
}
