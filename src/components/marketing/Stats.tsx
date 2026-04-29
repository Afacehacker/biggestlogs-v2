"use client";

import { motion } from "framer-motion";
import { Activity, Users, ShoppingCart, Zap } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const stats = [
  { label: "Network nodes", value: "50,000+", icon: Users, color: "text-blue-500" },
  { label: "Data packets", value: "1.2M+", icon: ShoppingCart, color: "text-primary" },
  { label: "System uptime", value: "99.99%", icon: Activity, color: "text-orange-500" },
  { label: "Ping latency", value: "< 2ms", icon: Zap, color: "text-orange-500" },
];

export const Stats = () => {
  return (
    <div id="stats" className="py-24 bg-black/40 backdrop-blur-md border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-20" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group overflow-hidden"
            >
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <stat.icon className="h-24 w-24" />
                </div>

                <div className={cn("p-2 rounded-xl bg-white/5 w-fit mb-4", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                    <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter">
                        {stat.value}
                    </div>
                    <div className="text-[10px] text-secondary-foreground/40 tracking-[0.2em] uppercase font-black">
                        {stat.label}
                    </div>
                </div>

                {/* Glitch Line Decor */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
