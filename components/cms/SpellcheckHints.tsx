"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { SpellIssue } from "@/lib/spellcheck";

export function SpellcheckBadge({
  hasIssues,
  checking,
}: {
  hasIssues: boolean;
  checking: boolean;
}) {
  if (checking) {
    return (
      <Loader2
        className="h-3.5 w-3.5 animate-spin text-amber-600"
        aria-label="Revisando ortografía"
      />
    );
  }
  if (!hasIssues) return null;
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-white shadow-sm"
      title="Posibles faltas ortográficas — revisa las sugerencias"
      aria-label="Posibles faltas ortográficas"
    >
      !
    </span>
  );
}

export function SpellcheckHints({
  issues,
  onApply,
}: {
  issues: SpellIssue[];
  onApply?: (issue: SpellIssue, replacement: string) => void;
}) {
  if (issues.length === 0) return null;

  return (
    <ul className="mt-1.5 space-y-1 rounded-lg border border-amber-200 bg-amber-50/90 px-2.5 py-2 text-xs text-amber-950">
      {issues.slice(0, 4).map((issue, i) => (
        <li key={`${issue.offset}-${issue.length}-${i}`} className="flex gap-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p>
              <span className="font-semibold text-amber-900">
                «{issue.excerpt}»
              </span>{" "}
              — {issue.message}
            </p>
            {onApply && issue.replacements[0] ? (
              <button
                type="button"
                onClick={() => onApply(issue, issue.replacements[0])}
                className="mt-0.5 font-semibold text-amber-800 underline hover:text-amber-950"
              >
                Usar: {issue.replacements[0]}
              </button>
            ) : null}
          </div>
        </li>
      ))}
      {issues.length > 4 ? (
        <li className="text-[11px] text-amber-700">
          +{issues.length - 4} avisos más
        </li>
      ) : null}
    </ul>
  );
}
