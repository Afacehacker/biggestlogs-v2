import { Navbar } from "@/components/marketing/Navbar";
import { NewHero } from "@/components/marketing/NewHero";
import { Stats } from "@/components/marketing/Stats";
import { Features } from "@/components/marketing/Features";
import { Footer } from "@/components/marketing/Footer";
import { TelegramPopup } from "@/components/marketing/TelegramPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="scanline" />
      <Navbar />
      <NewHero />
      <TelegramPopup />
      <Stats />
      <Features />
      <Footer />
    </main>
  );
}
