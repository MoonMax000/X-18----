import { TopBanner } from "@/components/Homepage/TopBanner";
import { HeroSection } from "@/components/Homepage/HeroSection";
import { FAQSection } from "@/components/Homepage/FAQSection";
import { Newsletter } from "@/components/Homepage/Newsletter";

export default function NewHome() {
  return (
    <div className="min-h-screen bg-black">
      <TopBanner />
      <HeroSection />
      <FAQSection />
      <Newsletter />
    </div>
  );
}
