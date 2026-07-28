import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Separa viñetas con formato «Título — descripción». */
export function splitOfertaTopic(topic: string) {
  const dash = topic.indexOf(" — ");
  return {
    label: dash >= 0 ? topic.slice(0, dash) : topic,
    detail: dash >= 0 ? topic.slice(dash + 3) : null,
  };
}

type OfertaFormativaItemProps = {
  title: string;
  intro?: string;
  topics?: readonly string[];
  meta?: React.ReactNode;
  /** En resúmenes bajo un h1 de página, usar `summary` (h2/h3). */
  variant?: "full" | "summary";
  titleClassName?: string;
  introClassName?: string;
  topicClassName?: string;
  iconClassName?: string;
  titleId?: string;
};

/**
 * Jerarquía SEO por taller/curso:
 * h1 título · h2 descripción · h3 cada tema.
 */
export function OfertaFormativaItem({
  title,
  intro,
  topics,
  meta,
  variant = "full",
  titleClassName,
  introClassName,
  topicClassName,
  iconClassName = "text-na-kefer",
  titleId,
}: OfertaFormativaItemProps) {
  const TitleTag = variant === "full" ? "h1" : "h2";
  const IntroTag = variant === "full" ? "h2" : "h3";
  const TopicTag = "h3";

  return (
    <>
      <TitleTag
        id={titleId}
        className={cn(
          "text-xl font-black text-na-heketDark sm:text-2xl",
          variant === "summary" && "text-lg",
          titleClassName,
        )}
      >
        {title}
      </TitleTag>
      {meta}
      {intro ? (
        <IntroTag
          className={cn(
            "mt-4 text-sm font-normal leading-relaxed text-na-muted sm:text-base",
            variant === "summary" && "mt-2 flex-1",
            introClassName,
          )}
        >
          {intro}
        </IntroTag>
      ) : null}
      {topics && topics.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {topics.map((topic) => {
            const { label, detail } = splitOfertaTopic(topic);
            return (
              <li
                key={topic.slice(0, 48)}
                className="flex gap-2.5 text-sm leading-relaxed text-na-muted"
              >
                <CheckCircle2
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    iconClassName,
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <TopicTag
                  className={cn("font-normal text-na-muted", topicClassName)}
                >
                  <span className="font-semibold text-na-heketDark">
                    {label}
                  </span>
                  {detail ? ` — ${detail}` : null}
                </TopicTag>
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}
