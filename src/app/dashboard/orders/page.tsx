"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  History, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  ExternalLink,
  ChevronRight,
  Loader2,
  Copy,
  X
} from "lucide-react";
import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";
import { useSession } from "next-auth/react";

async function fetchOrders(userId?: string) {
  if (!userId) return [];
  const res = await fetch(`${API_BASE_URL}/api/user/orders`, {
    headers: getApiHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}


export default function OrdersPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", session?.user?.id],
    queryFn: () => fetchOrders(session?.user?.id),
    enabled: !!session?.user?.id,
  });


  const filteredOrders = orders.filter((order: any) => 
    order.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  const copyAsset = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold font-outfit text-primary">Order History</h1>
        <p className="text-secondary-foreground/60">Manage your past purchases and access your digital accounts.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-foreground/30" />
        <input
          type="text"
          placeholder="Search by product name or order ID..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-white/10 bg-white/5">
          <Package className="h-16 w-16 text-secondary-foreground/20 mb-4" />
          <h3 className="text-xl font-bold mb-2">Order Archive Empty</h3>
          <p className="text-secondary-foreground/50 max-w-xs">You haven't made any purchases yet. Head over to the Marketplace to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order: any) => (
            <div 
              key={order.id}
              className="glass-dark rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary/30 transition-all group"
            >
              <div className="flex-1 flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" :
                  order.status === "FAILED" ? "bg-red-500/10 text-red-500" :
                  "bg-amber-500/10 text-amber-500"
                )}>
                  {order.status === "COMPLETED" ? <CheckCircle2 className="h-6 w-6" /> :
                   order.status === "FAILED" ? <XCircle className="h-6 w-6" /> :
                   <Clock className="h-6 w-6" />}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{order.serviceName}</h4>
                  <p className="text-xs font-mono text-secondary-foreground/40 tracking-tighter">REF: {order.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-secondary-foreground/40">Status</p>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    order.status === "FAILED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-secondary-foreground/40">Purchase Date</p>
                  <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-secondary-foreground/40">Amount Paid</p>
                  <p className="text-sm font-bold font-mono text-primary">{formatPrice(order.amount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {order.status === "COMPLETED" && (
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-primary px-6 py-2.5 rounded-xl text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all neon-glow"
                  >
                    <span>Fetch Details</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Assets Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass-dark rounded-3xl border border-white/10 shadow-2xl p-8"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold">{selectedOrder.serviceName}</h3>
                        <p className="text-xs text-secondary-foreground/40 font-mono">Order ID: {selectedOrder.id}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-bold text-secondary-foreground/60 uppercase tracking-widest">Account Credentials / Data</p>
                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative group">
                        <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                            {typeof selectedOrder.details === 'string' 
                            ? selectedOrder.details 
                            : JSON.stringify(selectedOrder.details, null, 2)}
                        </pre>
                        <button 
                            onClick={() => copyAsset(typeof selectedOrder.details === 'string' ? selectedOrder.details : JSON.stringify(selectedOrder.details))}
                            className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Copy className="h-4 w-4 text-primary" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                    >
                        Dismiss
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
