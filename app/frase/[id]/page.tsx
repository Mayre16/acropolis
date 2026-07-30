import type { Metadata } from "next";
import { FraseDelDiaShareView } from "@/components/home/FraseDelDiaShareView";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  getFraseDelDiaStaticParams,
  getMergedFraseDelDia,
} from "@/lib/cms/static-params";
import {
  FRASE_DEL_DIA_SHARE_TEXT,
  FRASE_DEL_DIA_SHARE_TITLE,
  fraseDelDiaSharePath,
} from "@/lib/frases-del-dia-share";

export async function generateStaticParams() {
  return getFraseDelDiaStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const frase = await getMergedFraseDelDia(id);
  if (!frase) {
    return { title: "Frase del día" };
  }
  const image = resolveCmsMediaUrl(frase.src) ?? frase.src;
  const title = FRASE_DEL_DIA_SHARE_TITLE;
  const description = FRASE_DEL_DIA_SHARE_TEXT;
  const path = fraseDelDiaSharePath(frase.id);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: image ? [{ url: image, alt: frase.alt || "Frase del día" }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function FraseDelDiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const frase = await getMergedFraseDelDia(id);
  return <FraseDelDiaShareView initial={frase} />;
}
