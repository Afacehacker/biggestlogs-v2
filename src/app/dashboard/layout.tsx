"use client";

import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  History, 
  Settings, 
  ChevronRight, 
  Menu, 
  X,
  Bell,
  ShieldAlert,
  LogOut,
  UserCircle,
  MessageCircle
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";
import { ChatWidget } from "@/components/support/ChatWidget";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Marketplace", href: "/dashboard/marketplace" },
  { icon: History, label: "My Orders", href: "/dashboard/orders" },
  { icon: Wallet, label: "Wallet & Balance", href: "/dashboard/wallet" },
  { icon: Settings, label: "Settings", href: "/dashboard/profile" },
];

const adminItems = [
  { icon: ShieldAlert, label: "Admin Panel", href: "/dashboard/admin" },
  { icon: MessageCircle, label: "Support Tickets", href: "/dashboard/admin/support" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: getApiHeaders(session?.user?.id as string)
      });
      return res.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-all duration-300 lg:static",
          isSidebarOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className={cn("text-xl font-bold tracking-tighter text-primary truncate", !isSidebarOpen && "lg:hidden")}>
            BIGGEST<span className="text-foreground">LOGS</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-secondary-foreground hover:text-primary">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all group",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground neon-glow" 
                  : "text-secondary-foreground/60 hover:bg-white/5 hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", pathname === item.href ? "" : "group-hover:scale-110 transition-transform")} />
              <span className={cn("font-medium transition-opacity", !isSidebarOpen && "lg:hidden")}>{item.label}</span>
              {pathname === item.href && isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          ))}

          {session.user.role === "ADMIN" && (
            <div className="pt-8 mb-4">
              <p className={cn("px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80 antialiased", !isSidebarOpen && "lg:hidden")}>Admin Control Center</p>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all group",
                    pathname === item.href 
                      ? "bg-red-500/20 text-red-500 border border-red-500/50" 
                      : "text-secondary-foreground/60 hover:bg-white/5 hover:text-red-400"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut()}
            className={cn(
              "flex w-full items-center space-x-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-secondary-foreground lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold truncate">
              {menuItems.find(i => i.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard/wallet" className="hidden sm:flex flex-col items-end mr-2 hover:opacity-80 transition-opacity">
              <span className="text-sm font-bold text-primary">{formatPrice(profile?.balance || 0)}</span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Available Balance</span>
            </Link>
            <div className="flex items-center space-x-2 bg-muted rounded-full px-4 py-2 border border-border">
              <UserCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">
                {(!session?.user?.name || session?.user?.name === "User") ? (session?.user?.email?.split('@')[0] || "Trader") : session?.user?.name}
              </span>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-secondary-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border border-black"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
}
