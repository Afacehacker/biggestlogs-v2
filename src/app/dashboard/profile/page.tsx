"use client";

import { useSession } from "next-auth/react";
import { 
  UserCircle, 
  Mail, 
  Shield, 
  Calendar, 
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-outfit">Profile Settings</h1>
        <p className="text-secondary-foreground/60">Manage your account information and security.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-dark rounded-3xl border border-white/10 p-8 text-center bg-gradient-to-b from-white/5 to-transparent">
            <div className="relative inline-block mb-6">
              <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 mx-auto">
                <UserCircle className="h-16 w-16 text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-background rounded-full border border-white/10">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold">{session.user.name}</h3>
            <p className="text-sm text-secondary-foreground/40 font-mono mb-6">{session.user.email}</p>
            
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                {session.user.role} Status
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                (session.user.totalSpent || 0) >= 500 ? "text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.3)]" :
                (session.user.totalSpent || 0) >= 200 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.3)]" :
                (session.user.totalSpent || 0) >= 50 ? "text-slate-300 bg-slate-300/10 border-slate-300/20" :
                "text-orange-700 bg-orange-700/10 border-orange-700/20"
              }`}>
                {(session.user.totalSpent || 0) >= 500 ? "Diamond VIP" :
                 (session.user.totalSpent || 0) >= 200 ? "Gold VIP" :
                 (session.user.totalSpent || 0) >= 50 ? "Silver VIP" :
                 "Bronze Member"}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out everywhere</span>
          </button>
        </div>

        {/* Account Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-dark rounded-3xl border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-bold">Personal Information</h4>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-foreground/40 ml-1">Full Name</label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-secondary-foreground font-medium">
                  {session.user.name}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-foreground/40 ml-1">Email Address</label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-secondary-foreground font-medium flex items-center justify-between">
                  <span>{session.user.email}</span>
                  <Shield className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-3xl border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2 text-orange-500">
              <Smartphone className="h-5 w-5" />
              <h4 className="text-lg font-bold">Security</h4>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-secondary-foreground/40">Add an extra layer of security</p>
                </div>
              </div>
              <button disabled className="text-xs font-bold text-primary/40 uppercase tracking-widest px-4 py-2 rounded-lg border border-primary/10">Disabled</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
