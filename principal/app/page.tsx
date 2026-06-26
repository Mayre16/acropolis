import { HomeHeroCms } from "@/components/home/HomeHeroCms";
import { WhatIsNACms } from "@/components/home/WhatIsNACms";
import { PillarsCms } from "@/components/home/PillarsCms";
import { PhilosophyLivingBandCms } from "@/components/home/PhilosophyLivingBandCms";
import { PhilosophyWheel } from "@/components/home/PhilosophyWheel";
import { HomeActivityPhotosSection } from "@/components/cms/HomeCmsEditContext";
import { HomePageShell } from "@/components/cms/HomePageShell";
import { EsferaHomeSection } from "@/components/home/EsferaHomeSection";
import { UpcomingActivitiesHome } from "@/components/home/UpcomingActivitiesHome";
import { HomeTalleresYCursosSection } from "@/components/home/HomeTalleresYCursosSection";
import { HomeSalonesCarousel } from "@/components/home/HomeSalonesCarousel";
import { InstagramFeedSection } from "@/components/home/InstagramFeedSection";
import { ContentDigitalSection } from "@/components/home/ContentDigitalSection";
import { SITE_URL, SOCIAL_LINKS } from "@/lib/site-config";

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
      <UpcomingActivitiesHome />
      <HomeTalleresYCursosSection />
      <HomeActivityPhotosSection />
      <HomeSalonesCarousel />
      <ContentDigitalSection />
      <InstagramFeedSection variant="carousel" showSocialHeader={false} />
    </>
    </HomePageShell>
  );
}
