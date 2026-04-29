"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, Menu, Wallet, Plus, Moon, Sun, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

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

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-2" : "bg-transparent py-4"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black font-outfit tracking-tighter text-foreground">
                BIGGEST<span className="text-primary">LOGS</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-8">
              <Link href="/#home" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/#services" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/dashboard/marketplace" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                All Services
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {session ? (
              <>
                <Link
                  href="/dashboard/wallet"
                  className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-1.5 border border-primary/20 transition-all group"
                >
                  <Wallet className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(profile?.balance || 0)}
                  </span>
                  <Plus className="h-3 w-3 text-primary opacity-50" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-sm font-bold text-foreground hover:text-primary transition-colors px-3"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-foreground hover:text-primary transition-colors px-4"
                >
                  LOGIN
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2 uppercase tracking-wide"
                >
                  REGISTER <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted-foreground"
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {session && (
               <Link
                href="/dashboard/wallet"
                className="flex items-center space-x-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
              >
                <span className="text-xs font-bold text-primary">
                  {formatPrice(profile?.balance || 0)}
                </span>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden bg-background/95 backdrop-blur-xl border-b border-white/5 transition-all overflow-hidden", isOpen ? "max-h-[400px] border-t" : "max-h-0")}>
        <div className="space-y-1 px-4 pb-6 pt-4">
          <Link href="/#home" className="block rounded-lg px-3 py-3 text-base font-bold text-foreground hover:bg-white/5" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/#services" className="block rounded-lg px-3 py-3 text-base font-bold text-muted-foreground hover:bg-white/5" onClick={() => setIsOpen(false)}>
            Services
          </Link>
          <Link href="/#features" className="block rounded-lg px-3 py-3 text-base font-bold text-muted-foreground hover:bg-white/5" onClick={() => setIsOpen(false)}>
            Features
          </Link>
          <Link href="/dashboard/marketplace" className="block rounded-lg px-3 py-3 text-base font-bold text-muted-foreground hover:bg-white/5" onClick={() => setIsOpen(false)}>
            All Services
          </Link>
          {session ? (
            <div className="pt-4 mt-2 border-t border-white/5 space-y-2">
              <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg text-foreground font-bold hover:bg-white/5" onClick={() => setIsOpen(false)}>
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 w-full text-left rounded-lg p-3 font-bold text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 mt-2 border-t border-white/5 space-y-3">
              <Link href="/login" className="block w-full text-center rounded-xl bg-white/5 px-3 py-3 text-base font-bold text-foreground" onClick={() => setIsOpen(false)}>
                LOGIN
              </Link>
              <Link href="/signup" className="block w-full text-center rounded-xl bg-primary px-3 py-3 text-base font-bold text-primary-foreground uppercase tracking-wide" onClick={() => setIsOpen(false)}>
                REGISTER
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
