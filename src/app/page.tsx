import { Navbar } from "@/components/marketing/Navbar";
import { NewHero } from "@/components/marketing/NewHero";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { Features } from "@/components/marketing/Features";
import { Footer } from "@/components/marketing/Footer";
import { TelegramPopup } from "@/components/marketing/TelegramPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      <Navbar />
      <NewHero />
      <ProductShowcase />
      <TelegramPopup />
      <Features />
      <Footer />
    </main>
  );
}
