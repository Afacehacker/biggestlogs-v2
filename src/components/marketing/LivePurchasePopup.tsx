"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

const purchaseEvents = [
  { name: "John D.", item: "10x Premium Facebook Accounts", time: "Just now" },
  { name: "Sarah M.", item: "5x USA TikTok Accounts", time: "2 mins ago" },
  { name: "Alex K.", item: "Instagram Aged Logs", time: "Just now" },
  { name: "Mike T.", item: "20x Twitter Verified", time: "5 mins ago" },
  { name: "Emma W.", item: "Snapchat Score Accounts", time: "1 min ago" },
];

export function LivePurchasePopup() {
  const [currentEvent, setCurrentEvent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start the first popup after 5 seconds
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Hide the popup after 4 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);

      return () => clearTimeout(hideTimer);
    } else {
      // Show next popup after a random interval between 10 and 25 seconds
      const nextDelay = Math.floor(Math.random() * (25000 - 10000 + 1)) + 10000;
      const showTimer = setTimeout(() => {
        setCurrentEvent((prev) => (prev + 1) % purchaseEvents.length);
        setIsVisible(true);
      }, nextDelay);

      return () => clearTimeout(showTimer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-4 bg-card/80 backdrop-blur-md border border-primary/20 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] max-w-sm"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-bold">{purchaseEvents[currentEvent].name}</span> purchased
            </p>
            <p className="text-sm font-bold text-primary truncate">
              {purchaseEvents[currentEvent].item}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {purchaseEvents[currentEvent].time}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors absolute top-2 right-2"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
