import { TopBanner } from "@/components/Homepage/TopBanner";
import { HeroSection } from "@/components/Homepage/HeroSection";
import { FeaturesSection } from "@/components/Homepage/FeaturesSection";
import { NewFAQSection } from "@/components/Homepage/NewFAQSection";
import { Newsletter } from "@/components/Homepage/Newsletter";

export default function NewHome() {
  return (
    <div className="min-h-screen bg-black">
      <TopBanner />
      <HeroSection />
      <FeaturesSection />
      <NewFAQSection />
      <Newsletter />
    </div>
  );
}
