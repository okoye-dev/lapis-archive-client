"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    // Dummy authentication logic
    if (email && password) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem(
        "userRole",
        email === "admin@example.com" ? "admin" : "user",
      );
      localStorage.setItem("userEmail", email);

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });

      if (email === "admin@example.com") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      toast({
        title: "Error",
        description: "Please enter your email and password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Lapis Archive
          </h1>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Sign In
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Demo:</strong> Use any email/password to sign in
            <br />
            <strong>Admin:</strong> admin@example.com
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
