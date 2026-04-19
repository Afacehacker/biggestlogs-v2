"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Server, Globe, Cpu, Lock } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 grid-background">
      <div className="scanline" />
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px]" />
        
        {/* Floating Data Nodes */}
        <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] p-4 glass-dark rounded-2xl border-primary/20 hidden lg:block"
        >
            <Server className="h-8 w-8 text-primary opacity-50" />
            <div className="mt-2 h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full w-1/2 bg-primary"
                />
            </div>
        </motion.div>

        <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[25%] left-[10%] p-4 glass-dark rounded-2xl border-blue-500/20 hidden lg:block"
        >
            <Cpu className="h-8 w-8 text-blue-500 opacity-50" />
            <div className="mt-2 space-y-1">
                <div className="h-1 w-8 bg-blue-500/20 rounded-full" />
                <div className="h-1 w-12 bg-blue-500/20 rounded-full" />
            </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col items-center text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
            >
                {/* Neon Ring Effect */}
                <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl animate-pulse" />
                
                <span className="relative inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-10 tracking-[0.2em] uppercase">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    <span>Protocol V2 Active</span>
                </span>
            </motion.div>
            
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] font-outfit"
            >
                OWN THE <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary/40 animate-gradient">DIGITAL FRONTIER</span>
            </motion.h1>
            
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto max-w-2xl text-lg md:text-xl text-secondary-foreground/60 mb-12 font-medium leading-relaxed"
            >
                High-performance assets, automated encryption, and instantaneous delivery. 
                Experience the world's most advanced digital log ecosystem.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
            >
                <Link
                    href="/signup"
                    className="group relative w-full sm:w-auto flex items-center justify-center space-x-3 rounded-2xl bg-primary px-10 py-5 text-lg font-black text-primary-foreground transition-all hover:scale-105 active:scale-95 neon-glow overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">INITIALIZE ACCESS</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative" />
                </Link>
                
                <Link
                    href="/#features"
                    className="w-full sm:w-auto flex items-center justify-center space-x-3 rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold text-foreground hover:bg-white/10 transition-all backdrop-blur-md group"
                >
                    <Lock className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span>VIEW SPECS</span>
                </Link>
            </motion.div>

            {/* Bottom Tech Bar */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1, duration: 2 }}
                className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            >
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest"><Globe className="h-4 w-4" /> GLOBAL_CDN</div>
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest"><Lock className="h-4 w-4" /> AES_256_ENC</div>
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest"><Cpu className="h-4 w-4" /> AUTO_PROC</div>
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest"><Zap className="h-4 w-4" /> INSTANT_LOGS</div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};
