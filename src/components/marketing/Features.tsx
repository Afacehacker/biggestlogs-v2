"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, Lock, Rocket, Target, Zap, ShieldCheck, Database, Layers } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Instant Delivery ⚡",
    description: "Automated instant fulfillment system ensures you receive your assets the moment your purchase is confirmed.",
  },
  {
    icon: Lock,
    title: "Advanced Security 🔐",
    description: "Your assets and personal identifiers are protected with top-tier encryption and decentralized storage.",
  },
  {
    icon: Target,
    title: "Heuristic Sorting",
    description: "Multi-point quality verification algorithm filters all incoming assets for 100% accuracy.",
  },
  {
    icon: Globe,
    title: "Distributed Core",
    description: "Global CDN nodes provide lightning-fast marketplace access from any point on Earth.",
  },
  {
    icon: Database,
    title: "Dynamic Inventory",
    description: "Real-time stock synchronization with global asset providers for up-to-the-minute listings.",
  },
  {
    icon: Layers,
    title: "Smart Bridging",
    description: "Seamless currency integration and instant balance settlement for high-speed trading.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-32 lg:py-48 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black tracking-[0.3em] uppercase text-primary mb-6"
          >
            <ShieldCheck className="h-3 w-3" />
            Core Infrastructure
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter font-outfit uppercase">ENGINEERED FOR <span className="text-primary">SPEED</span></h2>
          <p className="mx-auto max-w-2xl text-muted-foreground font-medium text-lg leading-relaxed">
            Our infrastructure is built for high-performance asset delivery with zero latency and absolute reliability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative p-10 rounded-[2.5rem] border border-border bg-card hover:bg-muted/50 transition-all hover:border-primary/30 overflow-hidden shadow-sm"
            >
                {/* Tech Corners decor */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 group-hover:border-primary transition-colors opacity-0 group-hover:opacity-100" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20 group-hover:border-primary transition-colors opacity-0 group-hover:opacity-100" />

                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-transparent text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all border border-primary/10">
                    <feature.icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
                </p>

                {/* Cyberpunk decor line */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-1 w-1 bg-white/10 group-hover:bg-primary/40 rounded-full transition-colors" />
                        ))}
                    </div>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
