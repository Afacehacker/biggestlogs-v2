"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock } from "lucide-react";
import Image from "next/image";

export function NewHero() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:pt-40">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8"
        >
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
              Introducing V2 (MongoDB Powered)
            </span>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            The Biggest <span className="text-primary">Plug</span> don land. Correct Logs only.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Get your premium logs and accounts sharp-sharp. No stories, no dulling. Correct quality straight to your front door.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <a
              href="/marketplace"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-105"
            >
              Start Buying Sharp
            </a>
            <a href="/login" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
              Enter In <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { label: 'Uptime', value: '99.9%', icon: Globe },
              { label: 'Security', value: 'Correct', icon: Shield },
              { label: 'Delivery', value: 'Fast-Fast', icon: Zap },
              { label: 'Privacy', value: 'Encrypted', icon: Lock },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32"
        >
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-xl bg-gray-900/50 p-2 ring-1 ring-white/10 glass-dark">
              <img
                src="/hero-preview.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
