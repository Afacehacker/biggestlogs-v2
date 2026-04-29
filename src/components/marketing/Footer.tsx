"use client";

import Link from "next/link";
import { Send, MapPin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-background pt-20 pb-10" id="contact">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block text-2xl font-black font-outfit tracking-tighter text-foreground mb-6">
              BIGGEST<span className="text-primary">LOGS</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your trusted partner for premium digital services and solutions. Providing secure, fast, and automated asset delivery.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-6 font-outfit">Services</h4>
            <ul className="space-y-4">
              <li><Link href="/dashboard/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">USA Numbers</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Buy Numbers</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Boost Accounts</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Cheap Data</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Log Accounts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-6 font-outfit">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/#home" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">All Services</Link></li>
              <li><Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-6 font-outfit">Support</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} BIGGESTLOGS. All rights reserved. | Designed for digital innovators.
          </p>
          <div className="text-sm font-medium text-muted-foreground">
            Developed by <span className="text-primary font-bold">AP TECHNOLOGIES</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
