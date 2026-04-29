"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export function NewHero() {
  return (
    <div className="relative isolate overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32 bg-background" id="home">
      {/* Premium Gradient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-800 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm font-medium text-foreground tracking-wide">DIGITAL SOLUTIONS</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-foreground font-outfit leading-[1.1]"
          >
            Premium Digital Services <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              At Your Fingertips
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-lg md:text-xl leading-relaxed text-muted-foreground font-medium max-w-2xl"
          >
            Get access to cutting-edge digital solutions including verified accounts, data plans, and premium logs. Everything you need in one secure platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-2xl bg-primary px-8 py-4 text-base font-black text-primary-foreground shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              REGISTER <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-base font-bold text-foreground hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              LOGIN
            </Link>
          </motion.div>

          {/* Quick Stats below hero */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl"
          >
            {[
              { label: 'Uptime', value: '99.9%', icon: Activity },
              { label: 'Security', value: '100%', icon: Shield },
              { label: 'Delivery', value: 'Instant', icon: Zap },
              { label: 'Global', value: 'Access', icon: Globe },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <stat.icon className="h-6 w-6 text-primary mb-3" />
                <span className="text-2xl md:text-3xl font-black text-foreground font-mono">{stat.value}</span>
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
