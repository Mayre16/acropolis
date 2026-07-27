import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProximamenteView } from "@/components/ProximamenteView";
import {
  getProximamenteSite,
  PROXIMAMENTE_SITE_IDS,
} from "@/lib/proximamente";

type Props = { params: Promise<{ site: string }> };

export function generateStaticParams() {
  return PROXIMAMENTE_SITE_IDS.map((site) => ({ site }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: id } = await params;
  const site = getProximamenteSite(id);
  if (!site) return { title: "Próximamente" };
  return {
    title: `${site.label} — Próximamente`,
    description: site.blurb,
    robots: { index: false, follow: true },
  };
}

export default async function ProximamenteSitePage({ params }: Props) {
  const { site: id } = await params;
  const site = getProximamenteSite(id);
  if (!site) notFound();
  return <ProximamenteView site={site} />;
}
