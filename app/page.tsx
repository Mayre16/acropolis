import dynamic from "next/dynamic";
import { HomeHeroCms } from "@/components/home/HomeHeroCms";
import { WhatIsNACms } from "@/components/home/WhatIsNACms";
import { PillarsCms } from "@/components/home/PillarsCms";
import { PhilosophyLivingBandCms } from "@/components/home/PhilosophyLivingBandCms";
import { HomePageShell } from "@/components/cms/HomePageShell";
import { SITE_URL, SOCIAL_LINKS } from "@/lib/site-config";
import { assetUrl } from "@/lib/asset-url";
import { HOME_HERO_BACKGROUND } from "@/lib/hero-images";

/** Secciones bajo el fold: no entran en el JS inicial (menos “JS sin usar”). */
const PhilosophyWheel = dynamic(
  () =>
    import("@/components/home/PhilosophyWheel").then((m) => ({
      default: m.PhilosophyWheel,
    })),
  { loading: () => null },
);
const EsferaHomeSection = dynamic(
  () =>
    import("@/components/home/EsferaHomeSection").then((m) => ({
      default: m.EsferaHomeSection,
    })),
  { loading: () => null },
);
const CirculoAmigosPromoCms = dynamic(
  () =>
    import("@/components/cms/CirculoAmigosPromoCms").then((m) => ({
      default: m.CirculoAmigosPromoCms,
    })),
  { loading: () => null },
);
const UpcomingActivitiesHome = dynamic(
  () =>
    import("@/components/home/UpcomingActivitiesHome").then((m) => ({
      default: m.UpcomingActivitiesHome,
    })),
  { loading: () => null },
);
const HomeTalleresYCursosSection = dynamic(
  () =>
    import("@/components/home/HomeTalleresYCursosSection").then((m) => ({
      default: m.HomeTalleresYCursosSection,
    })),
  { loading: () => null },
);
const HomeActivityPhotosSection = dynamic(
  () =>
    import("@/components/cms/HomeCmsEditContext").then((m) => ({
      default: m.HomeActivityPhotosSection,
    })),
  { loading: () => null },
);
const HomeSalonesCarousel = dynamic(
  () =>
    import("@/components/home/HomeSalonesCarousel").then((m) => ({
      default: m.HomeSalonesCarousel,
    })),
  { loading: () => null },
);
const HomeFrasesDelDiaSection = dynamic(
  () =>
    import("@/components/home/HomeFrasesDelDiaSection").then((m) => ({
      default: m.HomeFrasesDelDiaSection,
    })),
  { loading: () => null },
);
const ContentDigitalSection = dynamic(
  () =>
    import("@/components/home/ContentDigitalSection").then((m) => ({
      default: m.ContentDigitalSection,
    })),
  { loading: () => null },
);
const InstagramFeedSection = dynamic(
  () =>
    import("@/components/home/InstagramFeedSection").then((m) => ({
      default: m.InstagramFeedSection,
    })),
  { loading: () => null },
);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nueva Acrópolis República Dominicana",
  alternateName: "Organización Internacional Nueva Acrópolis",
  url: SITE_URL,
  description:
    "Escuela de filosofía a la manera clásica con actividades de cultura y voluntariado en República Dominicana.",
  sameAs: [
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.youtube,
    SOCIAL_LINKS.facebook,
  ],
  areaServed: "República Dominicana",
};

export default function Home() {
  return (
    <HomePageShell>
    <>
      <link
        rel="preload"
        as="image"
        href={assetUrl(HOME_HERO_BACKGROUND.src)}
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeHeroCms />
      <WhatIsNACms />
      <PillarsCms />
      <PhilosophyLivingBandCms />
      <PhilosophyWheel />
      <EsferaHomeSection />
      <CirculoAmigosPromoCms />
      <UpcomingActivitiesHome />
      <HomeTalleresYCursosSection />
      <HomeActivityPhotosSection />
      <HomeSalonesCarousel />
      <HomeFrasesDelDiaSection />
      <ContentDigitalSection />
      <InstagramFeedSection variant="carousel" showSocialHeader={false} />
    </>
    </HomePageShell>
  );
}
