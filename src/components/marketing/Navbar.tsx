"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, LogIn, LogOut, Menu, UserCircle, Wallet, Plus, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/50 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tighter text-primary">
                BIGGEST<span className="text-foreground">LOGS</span> ⚡
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/#features" className="text-secondary-foreground/70 hover:text-primary transition-colors px-3 py-2 text-sm font-medium">
                Features
              </Link>
              <Link href="/#stats" className="text-secondary-foreground/70 hover:text-primary transition-colors px-3 py-2 text-sm font-medium">
                Stats
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all text-foreground"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-sm font-medium text-secondary-foreground hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/wallet"
                    className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-1.5 border border-primary/20 transition-all group neon-glow"
                  >
                    <Wallet className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(profile?.balance || 0)}
                    </span>
                    <Plus className="h-3 w-3 text-primary opacity-50" />
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-secondary-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all neon-glow"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden items-center gap-3">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-secondary-foreground"
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {session && (
               <Link
                href="/dashboard/wallet"
                className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
              >
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary">
                  {formatPrice(profile?.balance || 0)}
                </span>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-secondary-foreground hover:bg-secondary hover:text-primary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden bg-black/95 transition-all overflow-hidden", isOpen ? "h-[320px]" : "h-0")}>
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
          <Link href="/#features" className="block rounded-md px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-secondary hover:text-primary" onClick={() => setIsOpen(false)}>
            Features
          </Link>
          <Link href="/#stats" className="block rounded-md px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-secondary hover:text-primary" onClick={() => setIsOpen(false)}>
            Stats
          </Link>
          {session ? (
            <>
              <div className="px-3 py-4 border-t border-white/5 mt-2">
                <p className="text-[10px] font-bold text-secondary-foreground/20 uppercase tracking-[0.2em] mb-3">Your Account</p>
                <Link href="/dashboard/wallet" className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 mb-2" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="font-bold text-primary">Wallet Balance</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{formatPrice(profile?.balance || 0)}</span>
                </Link>
                <Link href="/dashboard" className="flex items-center gap-3 p-3 text-secondary-foreground/60" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </div>
              <button
                onClick={() => signOut()}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-500 hover:bg-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block rounded-md px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-secondary hover:text-primary" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
              <Link href="/signup" className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-secondary" onClick={() => setIsOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
