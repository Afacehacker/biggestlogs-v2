"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Tag, 
  Layers,
  SearchX,
  Loader2,
  AlertCircle,
  X,
  Copy,
  CheckCircle2,
  PackageCheck
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";
import { useSession } from "next-auth/react";

async function fetchMarketplaceServices() {
  const res = await fetch(`${API_BASE_URL}/api/services`);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [purchasedOrder, setPurchasedOrder] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: fetchMarketplaceServices,
  });

  const categories = ["All", ...new Set(services.map((s: any) => s.category))];

  const filteredServices = services.filter((service: any) => {
    const matchesSearch = (service.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuy = async (service: any) => {
    if (!session?.user?.id) return toast.error("Please login first");
    
    try {
      toast.loading("Processing order...", { id: "order" });
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: getApiHeaders(session.user.id),
        body: JSON.stringify({ serviceId: service.id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to place order");

      toast.success("Order placed successfully!", { id: "order" });
      setPurchasedOrder(data.order);
      // Refresh balance in navbar/header
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (err: any) {
      toast.error(err.message, { id: "order" });
    }
  };

  const copyAsset = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-primary">Marketplace</h1>
          <p className="text-secondary-foreground/60">Purchase premium logs and accounts with instant delivery.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-foreground/30" />
          <input
            type="text"
            placeholder="Search for services, accounts, or logs..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-foreground/30" />
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer font-medium"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat: any) => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-red-500/5 border border-red-500/10">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-red-400">Connection Interrupted</h3>
          <p className="text-secondary-foreground/50 max-w-sm">Unable to connect to the TLogs marketplace. Please check your network or try again later.</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <SearchX className="h-12 w-12 text-secondary-foreground/20 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Matching Services</h3>
          <p className="text-secondary-foreground/50">Try different keywords or browse another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: any, index: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group glass-dark rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300 relative"
            >
               <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                    {service.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-secondary-foreground/30">
                    ID: {service.id}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{service.name}</h3>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold font-mono text-primary">
                      {formatPrice(service.finalPrice)}
                    </p>
                    <p className="text-[10px] text-secondary-foreground/40 uppercase font-bold">Balance Price</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold font-mono",
                      service.stock > 10 ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {service.stock} Units
                    </p>
                    <p className="text-[10px] text-secondary-foreground/40 uppercase font-bold">Availability</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 border-t border-white/5">
                <button
                  onClick={() => handleBuy(service)}
                  className="w-full bg-primary py-3.5 rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg neon-glow"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Confirm Purchase
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Success Asset Modal */}
      <AnimatePresence>
        {purchasedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPurchasedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-dark rounded-3xl border border-primary/30 shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                    <PackageCheck className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
                  <p className="text-secondary-foreground/60 text-sm">Your assets have been delivered. Copy them below.</p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-left relative group">
                  <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                    {typeof purchasedOrder.details === 'string' 
                      ? purchasedOrder.details 
                      : JSON.stringify(purchasedOrder.details, null, 2)}
                  </pre>
                  <button 
                    onClick={() => copyAsset(typeof purchasedOrder.details === 'string' ? purchasedOrder.details : JSON.stringify(purchasedOrder.details))}
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Copy className="h-4 w-4 text-primary" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setPurchasedOrder(null)}
                        className="w-full bg-white/10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
                    >
                        Close
                    </button>
                    <p className="text-[10px] text-secondary-foreground/40 italic">
                        Tip: You can always view your purchased assets in your Order History.
                    </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
