import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { UpcomingEvent } from "@/components/home/UpcomingEvent";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedGames />
        <UpcomingEvent />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
