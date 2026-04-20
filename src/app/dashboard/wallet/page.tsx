"use client";

import { motion } from "framer-motion";
import { 
  Wallet, 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History,
  CreditCard,
  Building2,
  Copy,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";

async function fetchWalletData(userId: string) {
  const [profileRes, transRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/user/profile`, { headers: getApiHeaders(userId) }),
    fetch(`${API_BASE_URL}/api/user/transactions`, { headers: getApiHeaders(userId) })
  ]);
  
  if (!profileRes.ok || !transRes.ok) throw new Error("Failed to fetch wallet data");
  
  return {
    profile: await profileRes.json(),
    transactions: await transRes.json()
  };
}

export default function WalletPage() {
  const { data: session } = useSession();
  const [showDeposit, setShowDeposit] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["walletData", session?.user?.id],
    queryFn: () => fetchWalletData(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  const handleDeposit = async () => {
    const amountInput = document.getElementById("depositAmount") as HTMLInputElement;
    const refInput = document.getElementById("paymentRef") as HTMLInputElement;
    const fileInput = document.getElementById("screenshot") as HTMLInputElement;

    if (!amountInput.value || !fileInput.files?.[0]) {
      return toast.error("Please provide amount and screenshot proof");
    }

    try {
      toast.loading("Submitting proof...", { id: "deposit" });
      const formData = new FormData();
      formData.append("amount", amountInput.value);
      formData.append("paymentRef", refInput.value);
      formData.append("screenshot", fileInput.files[0]);

      const res = await fetch(`${API_BASE_URL}/api/deposits`, {
        method: "POST",
        headers: {
          "x-user-id": session?.user?.id as string,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit proof");

      toast.success("Successfully submitted! Admin will verify soon.", { id: "deposit" });
      setShowDeposit(false);
    } catch (err) {
      toast.error("Error submitting proof. Try again.", { id: "deposit" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center text-primary">Loading wallet data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Your Account Balance 💰</h1>
          <p className="text-muted-foreground font-medium">Monitor your money sharp-sharp. No stories.</p>
        </div>
        <button 
          onClick={() => setShowDeposit(true)}
          className="flex items-center space-x-2 bg-primary px-6 py-3 rounded-xl text-primary-foreground font-bold hover:bg-primary/90 transition-all neon-glow"
        >
          <Plus className="h-5 w-5" />
          <span>Add Money</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden group rounded-3xl bg-gradient-to-br from-primary to-emerald-700 p-8 text-primary-foreground shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet className="h-32 w-32" />
            </div>
            
            <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">My Balance</p>
            <h2 className="text-5xl font-bold font-mono mb-8">
              {formatPrice(data?.profile?.balance || 0)}
            </h2>
            
            <div className="flex items-center space-x-4">
              <div className="h-10 w-16 bg-white/20 rounded-md backdrop-blur-md"></div>
              <p className="text-sm font-mono opacity-80">**** **** **** 4022</p>
            </div>
          </motion.div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-12">
          {/* Deposits Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-500">
              <ArrowDownCircle className="h-5 w-5" />
              Recent Deposits
            </h3>
            
            <div className="bg-card text-card-foreground shadow-sm rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.transactions?.filter((tx: any) => tx.type === "DEPOSIT").map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full border",
                          tx.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary-foreground/60">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-emerald-500">
                        +{formatPrice(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {(!data?.transactions?.some((tx: any) => tx.type === "DEPOSIT")) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm text-secondary-foreground/40">
                        No deposits found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchases Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-blue-500">
              <ArrowUpCircle className="h-5 w-5" />
              Purchase Activity
            </h3>
            
            <div className="bg-card text-card-foreground shadow-sm rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.transactions?.filter((tx: any) => tx.type === "DEDUCTION").map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Purchase</span>
                          <span className="text-[10px] font-mono text-secondary-foreground/30 truncate max-w-[100px]">
                            {tx.reference?.split('-')[1]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary-foreground/60">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-foreground">
                        -{formatPrice(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {(!data?.transactions?.some((tx: any) => tx.type === "DEDUCTION")) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm text-secondary-foreground/40">
                        No purchases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-4xl glass-dark rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] my-8"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black font-outfit tracking-tighter bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent mb-2">Deposit Funds</h3>
                  <div className="flex items-center gap-2 text-secondary-foreground/40 font-bold uppercase tracking-[0.2em] text-[10px]">
                    <span className="w-8 h-px bg-white/20" />
                    Secure Payment Gateway
                  </div>
                </div>
                <button 
                  onClick={() => setShowDeposit(false)}
                  className="p-2 rounded-xl hover:bg-white/5 text-secondary-foreground/40"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-stretch relative z-10">
                {/* Left Column: Bank Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-2xl space-y-8 flex-1">
                    <div className="space-y-2">
                        <div className="p-3 bg-primary/10 rounded-2xl w-fit text-primary mb-4">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight">Reciever Details</h4>
                        <p className="text-[11px] text-secondary-foreground/40 font-medium">Use the details below for your transfer.</p>
                    </div>
                    
                    <div className="space-y-5">
                      {[
                        { label: "Bank Name", value: "RUBIES MFB" },
                        { label: "Account Number", value: "8025329616", mono: true },
                        { label: "Account Name", value: "AFEEZ SALAUDEEN" }
                      ].map((item) => (
                        <div key={item.label} className="group/item relative">
                          <p className="text-[9px] uppercase font-black text-secondary-foreground/20 mb-2 tracking-[0.3em] px-1">{item.label}</p>
                          <div className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-white/5 group-hover/item:border-primary/40 transition-all">
                            <p className={cn("text-sm font-bold truncate", item.mono && "font-mono text-primary text-lg tracking-wider")}>{item.value}</p>
                            <button onClick={() => copyToClipboard(item.value)} className="p-2.5 bg-white/5 hover:bg-primary/20 rounded-xl text-secondary-foreground/40 hover:text-primary transition-all active:scale-90">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4 backdrop-blur-sm">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 h-fit">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Human Verification</p>
                      <p className="text-[10px] text-amber-200/50 leading-relaxed font-bold">
                        Verification is manual. Please allow 15-30 minutes for processing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Submission Form */}
                <div className="lg:col-span-3">
                  <div className="h-full flex flex-col p-10 md:p-12 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-2xl relative">
                    <div className="space-y-10">
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black text-secondary-foreground/40 px-2 tracking-[0.2em]">Deposit Amount</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-mono font-bold">₦</span>
                                <input 
                                    type="number" 
                                    placeholder="5,000"
                                    id="depositAmount"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono text-primary text-xl placeholder:text-primary/20"
                                />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black text-secondary-foreground/40 px-2 tracking-[0.2em]">Transfer Ref</label>
                            <input 
                              type="text" 
                              placeholder="Account Name"
                              id="paymentRef"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold placeholder:text-white/10"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-black text-secondary-foreground/40 px-2 tracking-[0.2em]">Upload Receipt</label>
                          <label htmlFor="screenshot" className="group block cursor-pointer">
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl group-hover:border-primary/40 group-hover:bg-primary/5 transition-all text-center">
                                <Plus className="h-8 w-8 text-secondary-foreground/20 mb-3 group-hover:text-primary transition-colors" />
                                <p className="text-xs font-bold text-secondary-foreground/40 group-hover:text-secondary-foreground transition-colors">Select screenshot proof from your files</p>
                                <input 
                                    type="file" 
                                    id="screenshot"
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button 
                            onClick={handleDeposit}
                            className="group relative w-full py-6 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden shadow-lg"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-4">
                                I Don Pay (Submit)
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between opacity-30">
                        <div className="flex gap-4">
                            <div className="w-10 h-6 bg-white/10 rounded" />
                            <div className="w-10 h-6 bg-white/10 rounded" />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Encrypted Connection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
