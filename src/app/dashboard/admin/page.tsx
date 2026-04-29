"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  ShoppingCart, 
  Settings, 
  TrendingUp, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Loader2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";
import { useSession } from "next-auth/react";

async function fetchAdminData(userId?: string) {
  if (!userId) return null;
  const res = await fetch(`${API_BASE_URL}/api/admin/data`, {
    headers: getApiHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to fetch admin data");
  return res.json();
}


export default function AdminPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [markup, setMarkup] = useState("500");
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["adminData", session?.user?.id],
    queryFn: () => fetchAdminData(session?.user?.id),
    enabled: !!session?.user?.id,
  });

  const updateMarkupMutation = useMutation({
    mutationFn: async (newValue: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: "POST",
        headers: getApiHeaders(session?.user?.id),
        body: JSON.stringify({ key: "MARKUP_PERCENTAGE", value: newValue }),
      });

      if (!res.ok) throw new Error("Failed to update markup");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Markup percentage updated!");
      queryClient.invalidateQueries({ queryKey: ["adminData"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-red-500 flex items-center gap-3">
            <Lock className="h-8 w-8" />
            Admin Control Center 🔐
          </h1>
          <p className="text-muted-foreground font-medium">Manage platform data, users, and global parameters.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/5 pb-px overflow-x-auto">
        {["overview", "payments", "users", "orders", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-secondary-foreground/40 hover:text-secondary-foreground"
            )}
          >
            {tab}
            {tab === "payments" && data?.stats?.totalPendingDeposits > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-background">
                {data.stats.totalPendingDeposits}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Registered Users</p>
              <h3 className="text-3xl font-bold font-mono">{data?.stats?.totalUsers || 0}</h3>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Total Sales</p>
              <h3 className="text-3xl font-bold font-mono">{data?.stats?.totalOrders || 0}</h3>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Pending Verifications</p>
              <h3 className="text-3xl font-bold font-mono text-amber-500">{data?.stats?.totalPendingDeposits || 0}</h3>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Active Markup</p>
              <h3 className="text-3xl font-bold font-mono text-primary">{data?.settings?.MARKUP_PERCENTAGE || "500"}%</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="bg-card text-card-foreground shadow-sm rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                <th className="px-6 py-4">User / Ref</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.deposits?.map((deposit: any) => (
                <tr key={deposit.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{deposit.user?.email}</span>
                      <span className="text-[10px] text-secondary-foreground/40 font-mono tracking-tighter truncate max-w-[200px]">
                        Ref: {deposit.paymentRef || "No reference"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold font-mono text-orange-500">{formatPrice(deposit.amount)}</td>
                  <td className="px-6 py-4">
                    {deposit.screenshotUrl ? (
                      <a href={`${API_BASE_URL}${deposit.screenshotUrl}`} target="_blank" className="text-primary hover:underline font-bold text-xs flex items-center gap-1">
                        View Proof
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {deposit.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={async () => {
                            const res = await fetch(`${API_BASE_URL}/api/admin/deposits/action`, {
                                method: "POST",
                                headers: getApiHeaders(session?.user?.id),
                                body: JSON.stringify({ depositId: deposit.id, action: "APPROVE" })
                            });
                            if (res.ok) {
                                toast.success("Deposit Approved");
                                queryClient.invalidateQueries({ queryKey: ["adminData"] });
                            }
                          }}
                          className="p-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-all border border-orange-500/20"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            const res = await fetch(`${API_BASE_URL}/api/admin/deposits/action`, {
                                method: "POST",
                                headers: getApiHeaders(session?.user?.id),
                                body: JSON.stringify({ depositId: deposit.id, action: "REJECT" })
                            });
                            if (res.ok) {
                                toast.error("Deposit Rejected");
                                queryClient.invalidateQueries({ queryKey: ["adminData"] });
                            }
                          }}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full",
                        deposit.status === "APPROVED" ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {deposit.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-card text-card-foreground shadow-sm rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.name}</span>
                      <span className="text-[10px] text-secondary-foreground/40 font-mono italic">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full border",
                        user.role === "ADMIN" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-secondary-foreground/60 border-white/10"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold font-mono text-primary">{formatPrice(user.balance)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={async () => {
                        const newBalance = prompt("Enter new balance for " + user.name, user.balance);
                        if (newBalance !== null) {
                            const res = await fetch(`${API_BASE_URL}/api/admin/users/update`, {
                                method: "POST",
                                headers: getApiHeaders(session?.user?.id),
                                body: JSON.stringify({ userId: user.id, balance: newBalance, role: user.role })
                            });
                            if (res.ok) {
                                toast.success("Balance Updated Sharp-Sharp!");
                                queryClient.invalidateQueries({ queryKey: ["adminData"] });
                            }
                        }
                      }}
                      className="p-2 bg-muted border border-border rounded-lg hover:border-primary/50 transition-all font-bold text-xs"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this user?")) {
                            const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
                                method: "DELETE",
                                headers: getApiHeaders(session?.user?.id)
                            });
                            if (res.ok) {
                                toast.error("User Deleted");
                                queryClient.invalidateQueries({ queryKey: ["adminData"] });
                            }
                        }
                      }}
                      className="p-2 bg-red-500/10 text-red-500 border border-red-500/10 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-card text-card-foreground shadow-sm rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                <th className="px-6 py-4">Order / User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-primary">{order.serviceName}</span>
                      <span className="text-[10px] text-secondary-foreground/40 font-mono tracking-tighter truncate max-w-[150px]">
                        User: {order.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        order.status === "COMPLETED" ? "bg-orange-500" : 
                        order.status === "FAILED" ? "bg-red-500" : "bg-amber-500"
                      )}></div>
                      <span className="font-bold text-[11px] uppercase">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-orange-500">{formatPrice(order.amount)}</span>
                      <span className="text-[9px] text-secondary-foreground/30 uppercase line-through">Base: {formatPrice(order.basePrice)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === "settings" && (
        <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card text-card-foreground p-8 rounded-3xl border border-border shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-2 text-primary">
              <Settings className="h-6 w-6" />
              <h3 className="text-xl font-bold">Pricing Logic</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold">Profit Markup %</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="500"
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic font-medium">
                Example: 500% markup means a ₦1,000 base price becomes ₦5,000 for the user.
              </p>
            </div>

            <button
              onClick={() => updateMarkupMutation.mutate(markup)}
              disabled={updateMarkupMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 neon-glow shadow-lg"
            >
              {updateMarkupMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Update Global Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
