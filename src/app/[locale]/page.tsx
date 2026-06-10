import { HeroSlider } from "@/features/home/components/hero-slider";
import { FeaturesBar } from "@/features/home/components/features-bar";
import { BestSellingSection } from "@/features/home/components/best-selling-section";
import { MostPopularSection } from "@/features/home/components/most-popular-section";
import { OccasionsSection } from "@/features/home/components/occasions-section";
import { AboutSection } from "@/features/home/components/about-section";
import { GallerySection } from "@/features/home/components/gallery-section";
import { TestimonialsSection } from "@/features/home/components/testimonials-section";
import { TrustedBySection } from "@/features/home/components/trusted-by-section";
import { Navbar } from "@/shared/layout/navbar";
import { Footer } from "@/shared/layout/footer";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-background dark:bg-zinc-800  space-y-4 sm:space-y-6">
            <Navbar />
            <HeroSlider />
            <OccasionsSection />
            <FeaturesBar />
            <BestSellingSection />
            <MostPopularSection />
            <AboutSection />
            <GallerySection />
            <TestimonialsSection />
            <TrustedBySection />
            <Footer />
        </main>
    );
}