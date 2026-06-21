import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import {
  type BrandLockupId,
  type BrandLogoVariant,
  BRAND_LOCKUPS,
  BRAND_TOP_MARK,
  LOCKUPS_WITH_DESCRIPTOR,
  LOCKUP_DESCRIPTOR_LABELS,
} from "@/lib/brand-assets";
import { assetUrl } from "@/lib/asset-url";
import {
  BRAND_DESCRIPTOR_GAP_RATIO,
  BRAND_DESCRIPTOR_TEXT_RATIO,
  BRAND_CLEAR_SPACE_RATIO,
  BRAND_LOGO_HEIGHT_DEFAULT,
  BRAND_WORDMARK_OFFSET_RATIO,
  BRAND_WORDMARK_WIDTH_RATIO,
  brandDescriptorStyle,
  lockupClearSpaceVariant,
} from "@/lib/brand-clear-space";

type BrandLogoProps = {
  lockup?: BrandLockupId;
  variant?: BrandLogoVariant;
  subtitle?: string;
  className?: string;
  subtitleClassName?: string;
  descriptorClassName?: string;
  descriptorProminence?: "default" | "hero";
  align?: "start" | "center";
  priority?: boolean;
  clearSpace?: boolean;
  maxWidthClass?: string;
  render?: "auto" | "hybrid" | "raster";
  markHeightRem?: number;
  lockupWidthRem?: number;
};

function usesHybrid(
  lockup: BrandLockupId,
  render: BrandLogoProps["render"],
): boolean {
  if (render === "raster") return false;
  if (render === "hybrid") return true;
  return LOCKUPS_WITH_DESCRIPTOR.includes(
    lockup as (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
  );
}

function markAspect(asset: { width: number; height: number }) {
  return asset.width / asset.height;
}

function hybridDescriptorFill(
  variant: BrandLogoVariant,
  prominence: "default" | "hero",
): string {
  if (variant === "white") {
    return prominence === "hero" ? "#ffffff" : "rgba(255, 255, 255, 0.85)";
  }
  return "#707070";
}

function WordmarkFitDescriptor({
  lockup,
  label,
  variant,
  descriptorProminence,
  descriptorClassName,
}: {
  lockup: "oina" | "oinadom" | "escuela" | "trilogo";
  label: string;
  variant: BrandLogoVariant;
  descriptorProminence: "default" | "hero";
  descriptorClassName?: string;
}) {
  const styles = brandDescriptorStyle(lockup, descriptorProminence);

  return (
    <svg
      className={cn("block w-full overflow-visible", descriptorClassName)}
      viewBox="0 0 1000 120"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={{
        marginTop: styles.marginTop,
        height: `calc(${styles.fontSize} * 1.35)`,
      }}
    >
      <text
        x={500}
        y={82}
        textAnchor="middle"
        fontFamily="var(--font-noto-sans), Noto Sans, sans-serif"
        fontWeight={700}
        fontSize={100}
        fill={hybridDescriptorFill(variant, descriptorProminence)}
        textLength={1000}
        lengthAdjust="spacingAndGlyphs"
      >
        {label}
      </text>
    </svg>
  );
}

function usesWordmarkFit(
  lockup: BrandLockupId,
  descriptorProminence: "default" | "hero",
): boolean {
  if (
    !LOCKUPS_WITH_DESCRIPTOR.includes(
      lockup as (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
    )
  ) {
    return false;
  }
  if (lockup === "oinadom" && descriptorProminence === "hero") return false;
  return true;
}

export function BrandLogo({
  lockup = "oinadom",
  variant = "color",
  subtitle,
  className,
  subtitleClassName,
  descriptorClassName,
  descriptorProminence = "default",
  align = "center",
  priority = false,
  clearSpace = false,
  maxWidthClass,
  render = "auto",
  markHeightRem,
  lockupWidthRem,
}: BrandLogoProps) {
  const hybrid = usesHybrid(lockup, render);
  const asset = hybrid ? BRAND_TOP_MARK : BRAND_LOCKUPS[lockup];
  const rawSrc = variant === "white" ? asset.webpWhite : asset.webp;
  const src = assetUrl(rawSrc);
  const aspect = markAspect(asset);
  const spaceRatio = BRAND_CLEAR_SPACE_RATIO[lockupClearSpaceVariant(lockup)];
  const showSubtitle =
    Boolean(subtitle) &&
    !LOCKUPS_WITH_DESCRIPTOR.includes(
      lockup as (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
    );
  const descriptorLabel = hybrid
    ? LOCKUP_DESCRIPTOR_LABELS[
        lockup as keyof typeof LOCKUP_DESCRIPTOR_LABELS
      ]
    : null;

  const wordmarkFit = usesWordmarkFit(lockup, descriptorProminence);

  const defaultSubtitleColor =
    variant === "white" ? "text-white/80" : "text-na-muted";

  const rootClass = cn(
    "inline-flex max-w-full overflow-visible leading-none",
    hybrid || showSubtitle
      ? cn(
          "flex-col",
          align === "start" ? "self-start" : "mx-auto self-center",
        )
      : align === "start"
        ? "items-start"
        : "items-center",
    !hybrid && !showSubtitle && align === "center" && "justify-center",
    !markHeightRem &&
      !lockupWidthRem &&
      `[--brand-logo-h:${BRAND_LOGO_HEIGHT_DEFAULT}]`,
    className,
  );

  const rootStyle: CSSProperties | undefined =
    markHeightRem !== undefined
      ? ({ "--brand-logo-h": `${markHeightRem}rem` } as CSSProperties)
      : undefined;

  const markStyle: CSSProperties =
    lockupWidthRem !== undefined
      ? {
          width: `${lockupWidthRem}rem`,
          height: `${(asset.height / asset.width) * lockupWidthRem}rem`,
        }
      : lockup === "na-solo"
        ? { height: "var(--brand-logo-h)", width: "auto" }
        : hybrid
          ? {
              height: "var(--brand-logo-h)",
              width: `calc(var(--brand-logo-h) * ${aspect})`,
            }
          : {
              height: "var(--brand-logo-h)",
              width: "auto",
            };

  const image = (
    <img
      src={src}
      alt={hybrid ? BRAND_LOCKUPS[lockup].alt : asset.alt}
      width={asset.width}
      height={asset.height}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(
        "block max-w-full shrink-0 object-contain",
        lockup === "na-solo" ? "h-[var(--brand-logo-h)] w-auto" : "h-auto w-auto",
        hybrid ? "object-center" : align === "start" ? "object-left" : "object-center",
        maxWidthClass,
      )}
      style={markStyle}
    />
  );

  const logoBody = clearSpace ? (
    <span
      className="inline-flex overflow-visible"
      style={{ padding: `${spaceRatio}em` }}
    >
      {image}
    </span>
  ) : (
    image
  );

  const descriptorNode =
    hybrid && descriptorLabel ? (
      wordmarkFit ? (
        <WordmarkFitDescriptor
          lockup={lockup as "oina" | "oinadom" | "escuela" | "trilogo"}
          label={descriptorLabel}
          variant={variant}
          descriptorProminence={descriptorProminence}
          descriptorClassName={descriptorClassName}
        />
      ) : (
        <span
          className={cn(
            "block w-full max-w-full uppercase leading-none",
            variant === "white"
              ? descriptorProminence === "hero"
                ? "text-white"
                : "text-white/85"
              : "text-[#707070]",
            lockup === "oina" ||
              lockup === "oinadom" ||
              lockup === "trilogo" ||
              lockup === "escuela"
              ? "font-bold"
              : "font-black",
            align === "start" ? "text-left" : "text-center",
            lockup === "trilogo" ? "whitespace-normal sm:whitespace-nowrap" : "whitespace-nowrap",
            descriptorClassName,
          )}
          style={{
            ...brandDescriptorStyle(
              lockup as "oina" | "oinadom" | "escuela" | "trilogo",
              descriptorProminence,
            ),
            maxWidth: "100%",
            fontFamily: "var(--font-noto-sans), sans-serif",
            fontWeight:
              lockup === "oina" ||
              lockup === "trilogo" ||
              lockup === "escuela" ||
              (lockup === "oinadom" && descriptorProminence !== "hero")
                ? 700
                : 900,
          }}
        >
          {descriptorLabel}
        </span>
      )
    ) : null;

  if (showSubtitle) {
    return (
      <span className={rootClass} style={rootStyle}>
        {logoBody}
        <span
          className={cn(
            "font-bold uppercase leading-none",
            align === "start" ? "text-left" : "text-center",
            defaultSubtitleColor,
            subtitleClassName,
          )}
          style={{
            marginTop: `${BRAND_DESCRIPTOR_GAP_RATIO}em`,
            fontSize: `${BRAND_DESCRIPTOR_TEXT_RATIO}em`,
            letterSpacing: "0.14em",
          }}
        >
          {subtitle}
        </span>
      </span>
    );
  }

  if (hybrid) {
    const wordmarkBand: CSSProperties | undefined = wordmarkFit
      ? {
          paddingLeft: `${BRAND_WORDMARK_OFFSET_RATIO * 100}%`,
          paddingRight: `${(1 - BRAND_WORDMARK_OFFSET_RATIO - BRAND_WORDMARK_WIDTH_RATIO) * 100}%`,
        }
      : undefined;

    return (
      <span className={rootClass} style={rootStyle}>
        <span
          className={cn(
            "inline-flex max-w-full flex-col overflow-visible pt-0.5",
            align === "start" ? "items-start" : "items-center",
          )}
          style={{ width: markStyle.width }}
        >
          {logoBody}
          {wordmarkBand ? (
            <span className="block w-full" style={wordmarkBand}>
              {descriptorNode}
            </span>
          ) : (
            descriptorNode
          )}
        </span>
      </span>
    );
  }

  return (
    <span className={rootClass} style={rootStyle}>
      {logoBody}
    </span>
  );
}
