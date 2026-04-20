"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  MessageCircle, 
  Search, 
  Send, 
  Loader2, 
  User, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminSupportPage() {
  const { data: session } = useSession();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["adminTickets"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin/tickets`, {
        headers: getApiHeaders(session?.user?.id as string)
      });
      return res.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 10000,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ ticketId, text }: { ticketId: string, text: string }) => {
        const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/messages`, {
            method: "POST",
            headers: { ...getApiHeaders(session?.user?.id as string), "Content-Type": "application/json" },
            body: JSON.stringify({ text, isAdmin: true })
        });
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
        setReply("");
        toast.success("Reply sent!");
    }
  });

  const activeTicket = tickets.find((t: any) => t.id === selectedTicketId);

  const handleSend = () => {
    if (!reply.trim() || !selectedTicketId) return;
    sendReplyMutation.mutate({ ticketId: selectedTicketId, text: reply });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar: Ticket List */}
      <div className="w-96 flex flex-col bg-card text-card-foreground rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Complaints & Feedback 🗣️
            </h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-foreground/20" />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="w-full bg-muted border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {isLoading ? (
                <div className="p-12 text-center text-secondary-foreground/20">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-xs">Loading tickets...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground/50">
                    <p className="text-sm font-bold">No Wahala 😇</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1 font-medium">Everywhere soft, nobody dey complain.</p>
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {tickets.map((ticket: any) => (
                        <button
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={cn(
                                "w-full p-4 flex items-start gap-4 hover:bg-muted/50 transition-all text-left",
                                selectedTicketId === ticket.id && "bg-muted border-l-2 border-primary"
                            )}
                        >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm truncate">{ticket.user?.name || "Anonymous User"}</h4>
                                    <span className="text-[10px] text-secondary-foreground/30 font-mono">
                                        {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-secondary-foreground/50 truncate mb-2">{ticket.subject}</p>
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                    ticket.status === "OPEN" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/5"
                                )}>
                                    {ticket.status}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className="flex-1 flex flex-col bg-card text-card-foreground rounded-3xl border border-border overflow-hidden shadow-sm">
        {activeTicket ? (
            <>
                {/* Chat Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                            <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold">{activeTicket.user?.name || "User"}</h3>
                            <p className="text-xs text-secondary-foreground/40">{activeTicket.user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {activeTicket.messages.map((msg: any) => (
                        <div key={msg.id} className={cn("flex flex-col", msg.isAdmin ? "items-end" : "items-start")}>
                            <div className={cn(
                                "max-w-[70%] p-4 rounded-3xl text-sm font-medium",
                                msg.isAdmin 
                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-xl shadow-primary/10" 
                                    : "bg-muted text-foreground rounded-tl-none border border-border"
                            )}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] mt-2 text-secondary-foreground/30 font-bold px-1 uppercase tracking-widest">
                                {msg.isAdmin ? "ADMIN_TERMINAL" : "USER_CLIENT"} • {new Date(msg.createdAt).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Reply Area */}
                <div className="p-6 bg-muted/30 border-t border-border">
                    <div className="relative flex items-center gap-4">
                        <input 
                            type="text" 
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type response to user..."
                            className="flex-1 bg-card border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-medium text-foreground"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!reply.trim() || sendReplyMutation.isPending}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 neon-glow flex items-center gap-2"
                        >
                            {sendReplyMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            <span>Transmit</span>
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="p-8 bg-white/5 rounded-full relative">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl animate-pulse" />
                    <MessageCircle className="h-20 w-20 text-primary/20 relative" />
                </div>
                <div className="max-w-xs">
                    <h4 className="text-2xl font-bold mb-2">Command Center</h4>
                    <p className="text-sm text-secondary-foreground/40 leading-relaxed uppercase tracking-widest font-bold">
                        Select a ticket from the relay to start a secure communication channel with the user.
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
