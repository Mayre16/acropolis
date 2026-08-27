import { Fragment } from "react";
import { parseInlineMarkdown } from "@/lib/cms/inline-rich-text";

/** Renderiza texto plano con negrita `**así**` (sin HTML libre). */
export function InlineRichText({ text }: { text: string }) {
  const parts = parseInlineMarkdown(text);
  return (
    <>
      {parts.map((part, i) =>
        part.type === "bold" ? (
          <strong key={i} className="font-semibold text-inherit">
            {part.text}
          </strong>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
