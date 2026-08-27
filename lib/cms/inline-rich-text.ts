/**
 * Negrita ligera para párrafos del CMS: `**texto**`.
 * No es HTML libre — solo ese marcado, seguro de renderizar.
 */

export function toggleMarkdownBold(
  value: string,
  start: number,
  end: number,
): { value: string; selectionStart: number; selectionEnd: number } {
  const s = Math.max(0, Math.min(start, end));
  const e = Math.max(0, Math.max(start, end));

  if (s === e) {
    const next = `${value.slice(0, s)}****${value.slice(e)}`;
    return {
      value: next,
      selectionStart: s + 2,
      selectionEnd: s + 2,
    };
  }

  const selected = value.slice(s, e);

  if (
    selected.startsWith("**") &&
    selected.endsWith("**") &&
    selected.length >= 4
  ) {
    const inner = selected.slice(2, -2);
    const next = `${value.slice(0, s)}${inner}${value.slice(e)}`;
    return {
      value: next,
      selectionStart: s,
      selectionEnd: s + inner.length,
    };
  }

  if (
    s >= 2 &&
    e + 2 <= value.length &&
    value.slice(s - 2, s) === "**" &&
    value.slice(e, e + 2) === "**"
  ) {
    const next = `${value.slice(0, s - 2)}${selected}${value.slice(e + 2)}`;
    return {
      value: next,
      selectionStart: s - 2,
      selectionEnd: s - 2 + selected.length,
    };
  }

  const next = `${value.slice(0, s)}**${selected}**${value.slice(e)}`;
  return {
    value: next,
    selectionStart: s,
    selectionEnd: e + 4,
  };
}

export type InlineRichPart =
  | { type: "text"; text: string }
  | { type: "bold"; text: string };

/** Parte `**negrita**` del resto del texto plano. */
export function parseInlineMarkdown(text: string): InlineRichPart[] {
  const parts: InlineRichPart[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", text: text.slice(last, m.index) });
    }
    parts.push({ type: "bold", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push({ type: "text", text: text.slice(last) });
  }
  if (parts.length === 0 && text) {
    parts.push({ type: "text", text });
  }
  return parts;
}
