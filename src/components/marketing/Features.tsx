"use client";

import { motion } from "framer-motion";
import { ShieldCheck, LayoutDashboard, Lock, Zap, Smartphone, HeadphonesIcon } from "lucide-react";
import Image from "next/image";

export const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-0 w-full h-[500px] bg-primary/5 -skew-y-6 transform-gpu pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Feature 1: Secure & Reliable */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-foreground mb-6 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Platform Security
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 font-outfit text-foreground tracking-tight">
              Secure & Reliable <br /> <span className="text-primary">Services</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              At Onegridhub, we prioritize security and reliability above all. Our platform uses advanced encryption and secure protocols to ensure your data and transactions are always protected.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              With 99.9% uptime and instant service delivery, you can count on us for all your digital needs.
            </p>
            
            <ul className="space-y-4">
              {[
                "Advanced 256-bit Encryption",
                "Strict Data Privacy Protocols",
                "Instant Automated Delivery System"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            
            <button className="mt-10 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
              Explore Security Features
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                    <Lock className="w-6 h-6 text-primary mb-2" />
                    <div className="h-2 w-16 bg-white/20 rounded-full" />
                  </div>
                  <div className="h-48 bg-gradient-to-b from-primary/20 to-white/5 rounded-2xl border border-primary/20 p-4 flex flex-col justify-end">
                     <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                     <div className="h-3 w-24 bg-white/20 rounded-full mb-2" />
                     <div className="h-2 w-16 bg-white/10 rounded-full" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-48 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                     <Zap className="w-8 h-8 text-orange-400 mb-2" />
                     <div className="h-3 w-20 bg-white/20 rounded-full mb-2" />
                     <div className="h-2 w-24 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                    <div className="h-2 w-16 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature 2: User-Friendly Dashboard */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 to-transparent rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-card/50 backdrop-blur-xl border border-white/10 p-2 rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="w-full h-8 bg-black/40 flex items-center px-4 gap-2 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="p-6 bg-black/20 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20" />
                            <div>
                                <div className="h-3 w-24 bg-white/20 rounded-full mb-2" />
                                <div className="h-2 w-16 bg-white/10 rounded-full" />
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">Pro Member</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-center">
                            <div className="h-6 w-16 bg-white/20 rounded-md mb-2" />
                            <div className="h-2 w-24 bg-white/10 rounded-full" />
                        </div>
                        <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-center">
                            <div className="h-6 w-20 bg-primary/40 rounded-md mb-2" />
                            <div className="h-2 w-24 bg-white/10 rounded-full" />
                        </div>
                    </div>
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5 mt-2" />
                </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-foreground mb-6 backdrop-blur-sm">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Intuitive Interface
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 font-outfit text-foreground tracking-tight">
              User-Friendly <br /> <span className="text-primary">Dashboard</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our intuitive dashboard makes it easy to manage all your services in one place. Track orders, monitor transactions, and access support with just a few clicks.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Whether you're a beginner or an expert, our platform is designed to provide the best user experience possible.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Mobile Ready</h4>
                  <p className="text-sm text-muted-foreground mt-1">Manage everything from your phone</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <HeadphonesIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">24/7 Support</h4>
                  <p className="text-sm text-muted-foreground mt-1">Always here to help you</p>
                </div>
              </div>
            </div>

            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-foreground font-bold hover:bg-white/10 transition-all">
              View Dashboard
            </button>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
