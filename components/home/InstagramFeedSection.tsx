"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { INSTAGRAM_POSTS } from "@/lib/home-content";
import { INSTAGRAM_HANDLE, SOCIAL_LINKS, YOUTUBE_HANDLE } from "@/lib/site-config";
import { assetUrl } from "@/lib/asset-url";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";
import { cn } from "@/lib/utils/cn";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

type Props = {
  /** `grid` en /contenido; `carousel` en home con avance automático. */
  variant?: "grid" | "carousel";
  /** Muestra eyebrow, @handles y YouTube. En home solo el carrusel. */
  showSocialHeader?: boolean;
};

export function InstagramFeedSection({
  variant = "grid",
  showSocialHeader = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = INSTAGRAM_POSTS.length;
  const visible = variant === "carousel" ? 3 : n;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    if (variant !== "carousel" || n <= visible || reduceMotion) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % (n - visible + 1)),
      4500,
    );
    return () => clearInterval(t);
  }, [variant, n, visible, reduceMotion]);

  const header = (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
        Redes sociales
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div>
            <h2 className="text-lg font-black text-na-heketDark sm:text-xl">
              @{INSTAGRAM_HANDLE}
            </h2>
            <LeaveSiteLink
              href={SOCIAL_LINKS.instagram}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-na-kefer hover:text-na-heketDark"
            >
              <InstagramIcon className="h-4 w-4" />
              Ver en Instagram
            </LeaveSiteLink>
          </div>
          <div>
            <h2 className="text-lg font-black text-na-heketDark sm:text-xl">
              @{YOUTUBE_HANDLE}
            </h2>
            <LeaveSiteLink
              href={SOCIAL_LINKS.youtube}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-na-kefer hover:text-na-heketDark"
            >
              <YoutubeIcon className="h-4 w-4" />
              Ver en YouTube
            </LeaveSiteLink>
          </div>
        </div>
      </div>
    </>
  );

  if (variant === "grid") {
    return (
      <section
        id="redes-sociales"
        className="scroll-mt-36 border-t border-na-heket/10 bg-[#eef0f2] py-12 sm:py-14"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {showSocialHeader ? header : null}
          <ul className={cn("grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-2.5", !showSocialHeader && "mt-0")}>
            {INSTAGRAM_POSTS.map((post) => (
              <li key={post.src}>
                <LeaveSiteLink
                  href={post.href}
                  className="group block overflow-hidden rounded-md bg-na-heket/5 sm:rounded-lg"
                  aria-label={post.alt}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={assetUrl(post.src)}
                      alt={post.alt}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 33vw, 120px"
                      unoptimized
                    />
                  </div>
                </LeaveSiteLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const maxIndex = Math.max(0, n - visible);

  return (
    <section className="border-t border-na-heket/10 bg-[#eef0f2] py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {showSocialHeader ? header : null}

        <div className={cn("relative", showSocialHeader ? "mt-6" : "mt-0")}>
          <div className="overflow-hidden rounded-xl">
            <ul
              className="flex gap-3 transition-transform duration-700 ease-in-out sm:gap-4"
              style={{
                transform: `translateX(calc(-${index} * ((100% - ${(visible - 1) * 0.75}rem) / ${visible} + 0.75rem)))`,
              }}
            >
              {INSTAGRAM_POSTS.map((post) => (
                <li
                  key={post.src}
                  className="w-[calc((100%-1.5rem)/3)] shrink-0 sm:w-[calc((100%-2rem)/3)]"
                >
                  <LeaveSiteLink
                    href={post.href}
                    className="group block overflow-hidden rounded-lg bg-na-heket/5 shadow-na-soft"
                    aria-label={post.alt}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={assetUrl(post.src)}
                        alt={post.alt}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 40vw, 220px"
                        unoptimized
                      />
                    </div>
                  </LeaveSiteLink>
                </li>
              ))}
            </ul>
          </div>

          {n > visible ? (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setIndex((i) => (i - 1 + maxIndex + 1) % (maxIndex + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white text-na-heket transition hover:bg-na-heket/5"
                aria-label="Publicaciones anteriores"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? "w-6 bg-na-heket"
                        : "w-2 bg-na-heket/25 hover:bg-na-heket/45"
                    }`}
                    aria-label={`Grupo de publicaciones ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % (maxIndex + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white text-na-heket transition hover:bg-na-heket/5"
                aria-label="Siguientes publicaciones"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
