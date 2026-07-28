"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ExternalLink } from "lucide-react";
import type { PlatformId } from "@/lib/site-config";
import { platformIsExternal, platformUrl } from "@/lib/site-config";

type PlatformTopButtonProps = {
  id: PlatformId;
  label: string;
  icon: LucideIcon;
  className: string;
  onClick?: () => void;
};

export function PlatformTopButton({
  id,
  label,
  icon: Icon,
  className,
  onClick,
}: PlatformTopButtonProps) {
  const href = platformUrl(id);
  const external = platformIsExternal(href);
  const content = (
    <>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
      {external ? (
        <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
      ) : null}
    </>
  );

  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold shadow-md transition";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} ${className}`}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${className}`} onClick={onClick}>
      {content}
    </Link>
  );
}
