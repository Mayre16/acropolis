import type { Metadata } from "next";
import { FraseDelDiaShareView } from "@/components/home/FraseDelDiaShareView";
import {
  absoluteCmsUploadUrl,
  getFraseDelDiaStaticParams,
  getMergedFraseDelDia,
} from "@/lib/cms/static-params";
import {
  FRASE_DEL_DIA_SHARE_TEXT,
  FRASE_DEL_DIA_SHARE_TITLE,
  fraseDelDiaSharePath,
} from "@/lib/frases-del-dia-share";
import { SITE_URL } from "@/lib/site-config";

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
  const image = absoluteCmsUploadUrl(frase.src);
  const title = FRASE_DEL_DIA_SHARE_TITLE;
  const description = FRASE_DEL_DIA_SHARE_TEXT;
  const path = fraseDelDiaSharePath(frase.id);
  const pageUrl = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      siteName: "Nueva Acrópolis República Dominicana",
      locale: "es_DO",
      images: image
        ? [
            {
              url: image,
              alt: frase.alt || "Frase del día",
              type: image.toLowerCase().endsWith(".png")
                ? "image/png"
                : "image/webp",
            },
          ]
        : [],
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
