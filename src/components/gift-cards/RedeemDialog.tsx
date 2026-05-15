import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Gift } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const RedeemDialog = ({ open, onOpenChange }: Props) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ amount: number; tier: string } | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-gift-card", {
        body: { code: code.trim().toUpperCase() },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Invalid code");
      setSuccess({ amount: data.amount, tier: data.tier });
      toast.success(`₹${data.amount} gift credit redeemed!`);
    } catch (e: any) {
      toast.error(e.message || "Could not redeem code");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCode("");
      setSuccess(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="max-w-md bg-background border-border/60">
        <DialogHeader>
          <DialogTitle className="font-cormorant text-2xl text-primary-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Redeem a Gift Card
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/70">
            Enter the code from your Bazuki gift card.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center space-y-3">
            <p className="font-cormorant text-3xl text-primary">
              ₹{success.amount.toLocaleString("en-IN")} added
            </p>
            <p className="text-sm text-muted-foreground">
              Your {success.tier} gift credit is ready. Visit{" "}
              <a href="/collection" className="text-primary underline">
                the collection
              </a>{" "}
              to start crafting.
            </p>
            <Button onClick={close} className="w-full rounded-full mt-2">
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Input
              autoFocus
              placeholder="BAZ-XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono tracking-wider text-center"
            />
            <Button
              onClick={handleRedeem}
              disabled={loading || code.length < 8}
              className="w-full rounded-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
