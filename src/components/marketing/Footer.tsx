"use client";

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-primary mb-4">
              BIGGEST<span className="text-foreground">LOGS</span>V2
            </Link>
            <p className="text-secondary-foreground/50 text-sm max-w-xs text-center md:text-left">
              The world&apos;s most advanced digital asset marketplace. Secure, fast, and automated.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">Market</h4>
              <ul className="space-y-4">
                <li><Link href="/dashboard" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Services</Link></li>
                <li><Link href="/dashboard" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Deposit</Link></li>
                <li><Link href="/dashboard" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">Support</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">API Docs</Link></li>
                <li><Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="hidden sm:block">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-secondary-foreground/40 text-xs gap-4">
          <p>© {new Date().getFullYear()} BIGGESTLOGSV2. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">Telegram</Link>
            <Link href="#" className="hover:text-primary transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
