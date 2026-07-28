import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventoDetail } from "@/components/cms/EventoDetail";
import { getEvento } from "@/lib/eventos";
import {
  getEventoStaticParams,
  getMergedEvento,
} from "@/lib/cms/static-params";

export async function generateStaticParams() {
  return getEventoStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ev = (await getMergedEvento(slug)) ?? getEvento(slug) ?? null;
  if (!ev) {
    return { title: "Evento" };
  }
  const keywords =
    ev.seoTags && ev.seoTags.length > 0
      ? ev.seoTags
      : [ev.category, "Nueva Acrópolis", "eventos"];
  return {
    title: ev.title,
    description: ev.excerpt,
    keywords,
    alternates: { canonical: `/eventos/${ev.slug}` },
    openGraph: {
      type: "article",
      title: ev.title,
      description: ev.excerpt,
      images: [{ url: ev.image.src }],
    },
  };
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merged = await getMergedEvento(slug);
  const fallback = getEvento(slug);
  if (!merged && !fallback && !process.env.NEXT_PUBLIC_CMS_URL) {
    notFound();
  }

  return <EventoDetail slug={slug} />;
}
