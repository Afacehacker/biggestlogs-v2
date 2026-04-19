"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingCart, 
  Wallet, 
  Clock,
  ArrowUpRight,
  Package,
  Activity,
  ChevronRight,
  Settings
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";

async function fetchDashboardStats(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
    headers: getApiHeaders(userId)
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}


export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: () => fetchDashboardStats(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  const { data: recentOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["recentOrders", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user/orders`, {
        headers: getApiHeaders(session?.user?.id as string)
      });
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  if (!session || isLoading || isLoadingOrders) return <div className="flex h-screen items-center justify-center text-primary">Loading dashboard...</div>;

  const totalSpent = recentOrders.reduce((sum: number, order: any) => sum + order.amount, 0);

  const statsCards = [
    { 
      label: "Total Balance", 
      value: formatPrice(profile?.balance || 0), 
      icon: Wallet, 
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      label: "Active Orders", 
      value: recentOrders.length.toString(), 
      icon: Package, 
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Total Spent", 
      value: formatPrice(totalSpent), 
      icon: ShoppingCart, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      label: "Success Rate", 
      value: "100%", 
      icon: Activity, 
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">
            Hello, <span className="text-primary">{session.user.name}</span>
          </h1>
          <p className="text-secondary-foreground/60">Welcome back to your command center.</p>
        </div>
        <div className="flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 text-primary font-medium text-sm animate-pulse">
          <TrendingUp className="h-4 w-4" />
          <span>Market Status: Normal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl", card.bg, card.color)}>
                <card.icon className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-secondary-foreground/20 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-medium text-secondary-foreground/40 mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold font-mono">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Orders
            </h3>
            <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-secondary-foreground/40 font-bold border-b border-white/5">
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold truncate max-w-[200px]">{order.serviceName}</p>
                        <p className="text-[10px] text-secondary-foreground/40 font-mono">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full border uppercase",
                          order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-primary">
                        {formatPrice(order.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
                <div className="text-center p-12">
                  <div className="bg-white/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <ShoppingCart className="h-8 w-8 text-secondary-foreground/20" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">No orders yet</h4>
                  <p className="text-secondary-foreground/50 text-sm max-w-xs mx-auto">
                    Start exploring our marketplace to find high-quality digital assets.
                  </p>
                </div>
            )}
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-6 text-primary-foreground hover:scale-[1.02] transition-all neon-glow">
              <Wallet className="h-6 w-6" />
              <span className="font-bold">Deposit Funds</span>
            </button>
            <button className="w-full py-4 px-6 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
                <span className="font-medium">Go to Marketplace</span>
              </div>
              <ChevronRight className="h-5 w-5 text-secondary-foreground/20" />
            </button>
            <button className="w-full py-4 px-6 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Settings className="h-5 w-5 text-orange-500" />
                </div>
                <span className="font-medium">Profile Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-secondary-foreground/20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
