import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";

interface LegalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const LegalDialog: React.FC<LegalDialogProps> = ({ isOpen, onClose, onAccept }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[111] m-auto max-w-2xl w-full h-fit bg-card rounded-4xl shadow-2xl overflow-hidden border border-border flex flex-col"
          >
            {/* Header */}
            <div className="bg-festive-ruby p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8" />
                <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-widest italic">Legal Disclaimer</h3>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-none">Compliance & Safety</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-2xl border border-border">
                <AlertTriangle className="w-6 h-6 text-festive-ruby shrink-0 mt-1" />
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-medium">
                  As per the <span className="font-black text-festive-ruby">Supreme Court directive (2018)</span>, the online sale of firecrackers is strictly prohibited. Customers may browse and select products on our website for estimation purposes only. 
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                  After selecting the required items, please submit your request using the <span className="font-bold underline decoration-primary decoration-2 underline-offset-4">“Get Estimate”</span> option. Our team will contact you within 2 hours to confirm the details.
                </p>

                <div className="h-px bg-border/50 w-full" />

                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic">
                  Crackers Kingdom operates in full compliance with all legal regulations under License: <span className="font-bold text-foreground">RSK AGENCIES (No: X/20XX)</span>. All orders are dispatched through authorized and registered transport services, following the standard legal procedures practiced in Sivakasi.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-0 flex flex-col md:flex-row gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-2xl border-2 border-border text-muted-foreground font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all"
              >
                I Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 px-8 py-4 rounded-2xl bg-festive-green text-white font-black text-xs uppercase tracking-widest hover:bg-festive-green/90 shadow-xl shadow-festive-green/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                I Understand & Accept
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LegalDialog;
