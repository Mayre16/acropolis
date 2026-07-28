import Link from "next/link";
import type { ReactNode } from "react";
import type { PlatformId } from "@/lib/site-config";
import { platformEffectiveUrl, platformIsExternal } from "@/lib/site-config";
import { urlNeedsLeavePrompt } from "@/lib/leave-site";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";

type PlatformLinkProps = {
  id: PlatformId;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

/** Enlace a plataforma: ruta interna o URL externa según entorno. */
export function PlatformLink({
  id,
  className,
  children,
  onClick,
}: PlatformLinkProps) {
  const href = platformEffectiveUrl(id);
  const external = platformIsExternal(href);

  if (external) {
    if (urlNeedsLeavePrompt(href)) {
      return (
        <LeaveSiteLink href={href} className={className} onClick={onClick}>
          {children}
        </LeaveSiteLink>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
