import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, ArrowLeft } from "lucide-react";

export function WhatsAppOtpLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const isValidPhone = /^[6-9]\d{9}$/.test(phone);

  const sendOtp = async () => {
    if (!isValidPhone) {
      toast({
        title: "Invalid number",
        description: "Enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-send-otp", {
        body: { phone },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({
        title: "OTP sent on WhatsApp",
        description: `Check WhatsApp on +91 ${phone} for your 6-digit code.`,
      });
      setStep("otp");
      setResendIn(60);
      setOtp("");
    } catch (err: any) {
      toast({
        title: "Could not send OTP",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-verify-otp", {
        body: { phone, otp: code },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.token_hash) throw new Error("Invalid response from server.");

      const { error: sessionErr } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.token_hash,
      });
      if (sessionErr) throw sessionErr;

      toast({ title: "Welcome to BAZUKI!", description: "You're signed in." });
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  if (step === "phone") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-md bg-[#25D366]/10 p-3 text-sm">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span>We'll send a 6-digit code on WhatsApp.</span>
        </div>
        <div>
          <Label htmlFor="wa-phone">Mobile Number</Label>
          <div className="mt-1 flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="wa-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidPhone && !loading) sendOtp();
              }}
              className="rounded-l-none"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">India only. Standard messaging rates may apply.</p>
        </div>
        <Button className="w-full" onClick={sendOtp} disabled={loading || !isValidPhone}>
          {loading ? "Sending..." : "Send OTP on WhatsApp"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setOtp("");
        }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Change number
      </button>
      <div>
        <Label>Enter the 6-digit code sent to +91 {phone}</Label>
        <div className="mt-2 flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(v) => {
              setOtp(v);
              if (v.length === 6 && !loading) verifyOtp(v);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      <Button className="w-full" onClick={() => verifyOtp(otp)} disabled={loading || otp.length !== 6}>
        {loading ? "Verifying..." : "Verify & Continue"}
      </Button>
      <div className="space-y-2 text-center text-sm">
        {resendIn > 0 && resendIn <= 30 && (
          <p className="animate-fade-in text-xs text-muted-foreground">
            Didn't get it? Make sure WhatsApp is installed on +91 {phone}.
          </p>
        )}
        {resendIn > 0 ? (
          <span className="text-muted-foreground">Resend OTP in {resendIn}s</span>
        ) : (
          <button
            type="button"
            onClick={sendOtp}
            disabled={loading}
            className="text-primary hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
