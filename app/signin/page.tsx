"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const SignIn = () => {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (sending || !trimmed) return;

    setSending(true);
    try {
      await sendOtp(trimmed);
      setStep("code");
      toast({
        title: "Check your email",
        description: `We sent a sign-in code to ${trimmed}.`,
      });
    } catch (err) {
      toast({
        title: "Couldn't send the code",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (verifying || !trimmedCode) return;

    setVerifying(true);
    try {
      await verifyOtp(email.trim(), trimmedCode);
      toast({
        title: "Signed in",
        description: "You're in. Head to your dashboard to upload and share.",
      });
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Couldn't verify the code",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "email"
              ? "Enter your email and we'll send you a one-time code."
              : `Enter the code we emailed to ${email.trim()}.`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify"}
            </Button>

            <Button
              type="button"
              variant="link"
              className="h-auto w-full p-0 text-sm text-muted-foreground"
              onClick={() => {
                setStep("email");
                setCode("");
              }}
            >
              Use a different email
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default SignIn;
