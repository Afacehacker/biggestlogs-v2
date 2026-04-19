"use client";

import { useState, useEffect, useRef } from "react";
import { 
    MessageCircle, 
    X, 
    Send, 
    Loader2, 
    User, 
    ShieldCheck, 
    HelpCircle, 
    ExternalLink, 
    ShoppingCart,
    MessageSquare,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getApiHeaders } from "@/lib/api-config";
import { cn, formatPrice } from "@/lib/utils";

const FAQS = [
    { q: "How long does delivery take?", a: "Most digital assets are delivered within 5 seconds of payment confirmation." },
    { q: "Is my payment secure?", a: "Yes, we use AES-256 encryption and vetted gateways for all transactions." },
    { q: "Can I get a refund?", a: "Refunds are processed if the asset is non-functional and reported within 2 hours." },
    { q: "How do I deposit funds?", a: "Go to the Wallet page, choose Deposit, and follow the manual bank transfer instructions." }
];

export const ChatWidget = () => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"faq" | "chat" | "orders">("faq");
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Fetch user orders for "Share Order" feature
    const { data: userOrders = [] } = useQuery({
        queryKey: ["userOrdersForChat"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/user/orders`, {
                headers: getApiHeaders(session?.user?.id as string)
            });
            return res.json();
        },
        enabled: !!session?.user?.id && view === "orders",
    });

    const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
        queryKey: ["supportTickets"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/support/tickets`, {
                headers: getApiHeaders(session?.user?.id as string)
            });
            return res.json();
        },
        enabled: !!session?.user?.id && isOpen,
        refetchInterval: 5000,
    });

    const createTicketMutation = useMutation({
        mutationFn: async (initialMessage: string) => {
            const res = await fetch(`${API_BASE_URL}/api/support/tickets`, {
                method: "POST",
                headers: { ...getApiHeaders(session?.user?.id as string), "Content-Type": "application/json" },
                body: JSON.stringify({ subject: "Support Request", initialMessage })
            });
            return res.json();
        },
        onSuccess: (data) => {
            setActiveTicketId(data.id);
            queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
            setMessage("");
            setView("chat");
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: async ({ ticketId, text }: { ticketId: string, text: string }) => {
            const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/messages`, {
                method: "POST",
                headers: { ...getApiHeaders(session?.user?.id as string), "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
            setMessage("");
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [tickets, activeTicketId, view]);

    const activeTicket = tickets.find((t: any) => t.id === activeTicketId) || tickets[0];
    
    useEffect(() => {
        if (activeTicket && !activeTicketId) {
            setActiveTicketId(activeTicket.id);
        }
    }, [activeTicket]);

    const handleSend = () => {
        if (!message.trim()) return;
        if (activeTicketId) {
            sendMessageMutation.mutate({ ticketId: activeTicketId, text: message });
        } else {
            createTicketMutation.mutate(message);
        }
    };

    const handleShareOrder = (order: any) => {
        const orderText = `I am having an issue with Order #${order.id} (${order.serviceName}) purchased for ${formatPrice(order.amount)}.`;
        if (activeTicketId) {
            sendMessageMutation.mutate({ ticketId: activeTicketId, text: orderText });
            setView("chat");
        } else {
            createTicketMutation.mutate(orderText);
        }
    };

    const startChat = () => {
        if (tickets.length > 0) {
            setView("chat");
        } else {
            createTicketMutation.mutate("I would like to talk to an agent.");
        }
    };

    if (!session) return null;

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[95]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] h-[550px] max-h-[80vh] glass-dark rounded-[2.5rem] border border-primary/20 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 bg-primary/10 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {view !== "faq" ? (
                                    <button onClick={() => setView("faq")} className="p-2 hover:bg-white/5 rounded-lg">
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="p-2 bg-primary/20 rounded-xl">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-extrabold text-sm tracking-tight">
                                        {view === "faq" ? "Support Terminal" : view === "orders" ? "Select Order" : "Secure Channel"}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Active Link</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="h-5 w-5 text-secondary-foreground/40" />
                            </button>
                        </div>

                        {/* View Switcher */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {view === "faq" && (
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-foreground/30">Automated Q&A</h5>
                                        <div className="space-y-3">
                                            {FAQS.map((faq, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                                    <p className="text-xs font-bold text-primary flex items-center gap-2">
                                                        <HelpCircle className="h-3 w-3" />
                                                        {faq.q}
                                                    </p>
                                                    <p className="text-xs text-secondary-foreground/50 leading-relaxed">{faq.a}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-foreground/30">Lodge Complaint</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={startChat}
                                                className="p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-left group"
                                            >
                                                <MessageSquare className="h-5 w-5 text-primary mb-2" />
                                                <p className="text-xs font-bold text-white">Talk to Admin</p>
                                                <p className="text-[9px] text-secondary-foreground/40 mt-1">Direct relay to support</p>
                                            </button>
                                            <button 
                                                onClick={() => setView("orders")}
                                                className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-left group"
                                            >
                                                <ShoppingCart className="h-5 w-5 text-blue-500 mb-2" />
                                                <p className="text-xs font-bold text-white">Issue with Order</p>
                                                <p className="text-[9px] text-secondary-foreground/40 mt-1">Select from history</p>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
                                        <p className="text-[10px] font-bold text-amber-500/50">Average response time: 5-15 Minutes</p>
                                    </div>
                                </div>
                            )}

                            {view === "orders" && (
                                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-foreground/30 mb-4">Select Associated Order</h5>
                                    {userOrders.length === 0 ? (
                                        <p className="text-center py-12 text-xs text-secondary-foreground/30">No orders found.</p>
                                    ) : (
                                        userOrders.map((order: any) => (
                                            <button 
                                                key={order.id}
                                                onClick={() => handleShareOrder(order)}
                                                className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 text-left transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs font-bold truncate pr-4">{order.serviceName}</p>
                                                    <span className="text-[9px] font-mono text-primary">{formatPrice(order.amount)}</span>
                                                </div>
                                                <p className="text-[10px] font-mono text-secondary-foreground/30">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {view === "chat" && (
                                <>
                                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
                                        {isLoadingTickets ? (
                                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                            </div>
                                        ) : activeTicket?.messages.map((msg: any) => (
                                            <div key={msg.id} className={cn("flex flex-col", msg.isAdmin ? "items-start" : "items-end")}>
                                                <div className={cn(
                                                    "max-w-[85%] p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed",
                                                    msg.isAdmin 
                                                        ? "bg-white/10 text-white rounded-tl-none border border-white/5" 
                                                        : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10"
                                                )}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[8px] mt-1 text-secondary-foreground/20 font-black uppercase tracking-widest px-1">
                                                    {msg.isAdmin ? "ADMIN" : "YOU"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-black/20 border-t border-white/5">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                placeholder="Ask the admin..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                                            />
                                            <button 
                                                onClick={handleSend}
                                                disabled={!message.trim() || sendMessageMutation.isPending}
                                                className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 neon-glow active:scale-95 transition-all disabled:opacity-30"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 md:h-16 md:w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl neon-glow relative group"
            >
                <div className="absolute inset-0 rounded-full bg-primary blur-lg opacity-20 animate-pulse" />
                {isOpen ? <X className="h-6 w-6 md:h-7 md:w-7" /> : <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />}
                
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black text-white">
                        !
                    </div>
                )}
            </motion.button>
        </div>
    );
};
