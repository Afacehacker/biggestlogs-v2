"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Send, ExternalLink } from "lucide-react";

export const TelegramPopup = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show after 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsVisible(false)}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md glass-dark rounded-[2.5rem] border border-primary/30 shadow-[0_32px_64px_-16px_rgba(var(--primary-rgb),0.3)] overflow-hidden"
                >
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-secondary-foreground/40 transition-colors z-10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="p-10 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                <div className="relative h-20 w-20 bg-gradient-to-br from-primary to-orange-600 rounded-3xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                                    <Send className="h-10 w-10 text-white -mr-1" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-black font-outfit tracking-tighter">JOIN THE FLEET</h3>
                            <p className="text-secondary-foreground/60 font-medium">
                                Get instant updates on restocks, vouchers, and exclusive premium logs in our private channel.
                            </p>
                        </div>

                        <a 
                            href="https://t.me/boostnaija1" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center space-x-3 w-full bg-primary py-5 rounded-2xl text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow shadow-lg shadow-primary/20"
                        >
                            <span>Join Telegram</span>
                            <ExternalLink className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>

                        <p className="text-[10px] text-secondary-foreground/20 font-bold uppercase tracking-[0.3em]">
                            Over 10,000+ Active Members
                        </p>
                    </div>
                    
                    {/* Decorative bottom bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
