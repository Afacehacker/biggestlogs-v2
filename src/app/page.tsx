import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Stats } from "@/components/marketing/Stats";
import { Features } from "@/components/marketing/Features";
import { Footer } from "@/components/marketing/Footer";
import { TelegramPopup } from "@/components/marketing/TelegramPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TelegramPopup />
      <Stats />
      <Features />
      <Footer />
    </main>
  );
}
