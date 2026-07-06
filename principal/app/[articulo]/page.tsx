import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticuloDetail } from "@/components/cms/ArticuloDetail";
import { getArticulo } from "@/lib/articulos";
import {
  getArticuloStaticParams,
  getMergedArticulo,
} from "@/lib/cms/static-params";

export async function generateStaticParams() {
  return getArticuloStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articulo: string }>;
}): Promise<Metadata> {
  const { articulo } = await params;
  const a =
    (await getMergedArticulo(articulo)) ?? getArticulo(articulo) ?? null;
  if (!a) {
    return { title: "Blog" };
  }
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.excerpt,
      images: [{ url: a.image.src }],
    },
  };
}

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ articulo: string }>;
}) {
  const { articulo } = await params;
  const merged = await getMergedArticulo(articulo);
  const fallback = getArticulo(articulo);
  if (!merged && !fallback && !process.env.NEXT_PUBLIC_CMS_URL) {
    notFound();
  }

  return <ArticuloDetail slug={articulo} />;
}
