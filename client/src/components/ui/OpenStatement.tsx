import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface OpenStatementProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const OpenStatement: React.FC<OpenStatementProps> = ({ isOpen, onOpenChange }) => {
    const navigate = useNavigate();

    const handleGetEstimate = () => {
        onOpenChange(false);
        navigate("/products");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[450px] p-6 gap-6 rounded-xl border border-border bg-card shadow-2xl">
                <DialogHeader className="space-y-3 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            Important Legal Notice
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        As per Supreme Court Order (2018)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm font-bold text-destructive italic text-center sm:text-left">
                        "Online sale of firecrackers is strictly prohibited."
                    </p>

                    <div className="text-sm text-foreground/80 leading-relaxed space-y-3">
                        <p>
                            You may browse our catalog for <span className="font-bold underline cursor-default">price estimation purposes only</span>. To proceed, add items and click "Get Estimate".
                        </p>
                        <p>
                            Our team responds to all inquiries within 2 hours.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground leading-snug">
                        <p className="font-semibold text-foreground mb-1">Crackers Kingdom License:</p>
                        <p>RSK AGENCIES (No: X/20XX)</p>
                        <p className="mt-2 text-[10px] italic">
                            Dispatched only via authorized transport services in Sivakasi.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-lg px-6 font-bold text-xs uppercase tracking-widest hover:bg-secondary"
                    >
                        Continue
                    </Button>
                    <Button
                        onClick={handleGetEstimate}
                        className="h-10 rounded-lg bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20"
                    >
                        Get Estimate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OpenStatement;