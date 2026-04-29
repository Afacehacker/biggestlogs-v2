"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ShoppingCart, CheckCircle2, ChevronRight, Zap, Shield, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";
import { useRouter } from "next/navigation";

async function fetchMarketplaceServices() {
  const res = await fetch(`${API_BASE_URL}/api/services`);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export function ProductShowcase() {
  const router = useRouter();
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: fetchMarketplaceServices,
  });

  const getDisplayServices = (allServices: any[]) => {
    const inStock = allServices.filter(s => s.stock > 0);
    
    const getCheapest = (keyword: string) => {
      const matches = inStock.filter(s => 
        (s.name && s.name.toLowerCase().includes(keyword)) || 
        (s.category && s.category.toLowerCase().includes(keyword))
      );
      if (matches.length === 0) return null;
      return matches.reduce((prev, curr) => prev.finalPrice < curr.finalPrice ? prev : curr);
    };

    const fb = getCheapest('facebook');
    const ig = getCheapest('instagram');
    const tt = getCheapest('tiktok');

    const selectedIds = new Set([fb?.id, ig?.id, tt?.id].filter(Boolean));
    const selected = [fb, ig, tt].filter(Boolean);

    // Fill the rest up to 6
    for (const s of inStock) {
      if (selected.length >= 6) break;
      if (!selectedIds.has(s.id)) {
        selected.push(s);
        selectedIds.add(s.id);
      }
    }
    
    // If we still don't have 6 (e.g. not enough in-stock), fill with out-of-stock
    if (selected.length < 6) {
        for (const s of allServices) {
            if (selected.length >= 6) break;
            if (!selectedIds.has(s.id)) {
                selected.push(s);
                selectedIds.add(s.id);
            }
        }
    }
    return selected;
  };

  const displayServices = getDisplayServices(services);
  return (
    <section className="py-24 bg-background relative z-10" id="services">
      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold uppercase tracking-wider mb-6"
          >
            <Star className="w-4 h-4" /> Our Core Services
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-outfit text-foreground tracking-tight"
          >
            Premium Digital Solutions
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Access top-tier logs, accounts, and digital assets instantly. Built for reliability and security.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-red-500/5 border border-red-500/10">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-red-400">Services Offline</h3>
            <p className="text-muted-foreground max-w-sm">We're having trouble reaching the marketplace right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayServices.map((service: any, index: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push('/dashboard/marketplace')}
                className="group relative bg-card/40 backdrop-blur-md rounded-3xl border border-white/5 hover:border-primary/50 transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3 font-outfit line-clamp-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    Premium {service.category} guaranteed for highest quality and reliability. Instant access upon purchase.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Instant activation",
                      "100% Verified Quality",
                      service.stock > 0 ? "In Stock & Ready" : "Out of Stock"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Starting from</p>
                      <p className="text-2xl font-black text-foreground font-mono">{formatPrice(service.finalPrice)}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push('/dashboard/marketplace'); }}
                      className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors border border-primary/20 group-hover:border-primary"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <button 
            onClick={() => router.push('/dashboard/marketplace')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-foreground"
          >
            View All Services <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
