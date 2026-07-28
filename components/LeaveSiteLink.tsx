"use client";

import {
  useCallback,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import {
  getLeaveSiteDestinationLabel,
  urlNeedsLeavePrompt,
} from "@/lib/leave-site";

type LeaveSiteLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children"
> & {
  href: string;
  children: ReactNode;
};

export function LeaveSiteLink({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  onClick,
  ...rest
}: LeaveSiteLinkProps) {
  const [open, setOpen] = useState(false);
  const needsPrompt = urlNeedsLeavePrompt(href);
  const destination = getLeaveSiteDestinationLabel(href);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!needsPrompt || event.defaultPrevented) return;
    event.preventDefault();
    setOpen(true);
  };

  const proceed = () => {
    close();
    window.open(href, target, "noopener,noreferrer");
  };

  return (
    <>
      <a
        href={href}
        className={className}
        target={target}
        rel={rel}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </a>

      {open && needsPrompt ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-na-ink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-site-title"
          onClick={close}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] bg-na-surface p-6 shadow-na-card sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-na-heket/10 text-na-heketDark transition hover:bg-na-heket/20"
            >
              <X className="h-5 w-5" />
            </button>

            <h2
              id="leave-site-title"
              className="pr-10 text-xl font-black text-na-heketDark sm:text-2xl"
            >
              Vas a salir de esta página
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-na-muted">
              Estás a punto de abrir {destination} en una nueva pestaña.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-na-heket/20 px-5 py-2.5 text-sm font-semibold text-na-heketDark transition hover:bg-na-heket/5"
              >
                Quedarme aquí
              </button>
              <button
                type="button"
                onClick={proceed}
                className="rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-kefer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
