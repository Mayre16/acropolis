"use client";

import { useEffect, useRef, useState } from "react";
import { cmsApiBase } from "@/lib/cms/api-client";

export type SpellIssue = {
  message: string;
  offset: number;
  length: number;
  replacements: string[];
  excerpt: string;
};

const SKIP_LABEL =
  /url|slug|iso|whatsapp|crédito|credito|id\b|fecha iso/i;

export function shouldSpellcheckField(label: string, value: string): boolean {
  if (SKIP_LABEL.test(label)) return false;
  if (/^https?:\/\//i.test(value.trim())) return false;
  if (/^\/uploads\//i.test(value.trim())) return false;
  return true;
}

export async function fetchSpellIssues(text: string): Promise<SpellIssue[]> {
  const trimmed = text.trim();
  if (trimmed.length < 4) return [];

  const res = await fetch(`${cmsApiBase()}/spellcheck`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { issues?: SpellIssue[] };
  return data.issues ?? [];
}

export function applySpellReplacement(
  text: string,
  issue: SpellIssue,
  replacement: string,
): string {
  return (
    text.slice(0, issue.offset) + replacement + text.slice(issue.offset + issue.length)
  );
}

export function useSpellcheck(text: string, enabled: boolean) {
  const [issues, setIssues] = useState<SpellIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled || text.trim().length < 4) {
      setIssues([]);
      setChecking(false);
      return;
    }

    const id = ++reqId.current;
    setChecking(true);
    const timer = window.setTimeout(() => {
      fetchSpellIssues(text)
        .then((found) => {
          if (reqId.current !== id) return;
          setIssues(found);
        })
        .catch(() => {
          if (reqId.current !== id) return;
          setIssues([]);
        })
        .finally(() => {
          if (reqId.current !== id) return;
          setChecking(false);
        });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [text, enabled]);

  return { issues, checking, hasIssues: issues.length > 0 };
}
