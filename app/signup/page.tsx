"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const SignUp = () => {
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  const cropOptions = [
    { id: "rice", label: "Rice" },
    { id: "wheat", label: "Wheat" },
    { id: "cotton", label: "Cotton" },
    { id: "sugarcane", label: "Sugarcane" },
    { id: "maize", label: "Maize" },
    { id: "cassava", label: "Cassava" },
    { id: "yam", label: "Yam" },
    { id: "vegetables", label: "Vegetables" },
    { id: "fruits", label: "Fruits" },
    { id: "pulses", label: "Pulses" },
  ];

  const handleCropTypeChange = (cropId: string, checked: boolean) => {
    if (checked) {
      setCropTypes([...cropTypes, cropId]);
    } else {
      setCropTypes(cropTypes.filter((id) => id !== cropId));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (name && email && password) {
      setStep(2);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (cropTypes.length > 0 && location && language) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCropTypes", JSON.stringify(cropTypes));
      localStorage.setItem("userLocation", location);
      localStorage.setItem("userLanguage", language);

      toast({
        title: "Account created!",
        description: "Welcome to Lapis Archive!",
      });

      router.push("/dashboard");
    } else {
      toast({
        title: "Error",
        description:
          "Please fill in all fields and select at least one crop type",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            🌾 Lapis Archive
          </h1>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Create Account
          </h2>
          <p className="text-sm text-muted-foreground">
            Join thousands of users using AI for better harvests
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div
              className={`h-1 w-12 ${step >= 2 ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="mb-4">
              <h3 className="mb-1 font-semibold text-foreground">
                Step 1: Account Details
              </h3>
              <p className="text-sm text-muted-foreground">
                Create your login credentials
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="mb-4">
              <h3 className="mb-1 font-semibold text-foreground">
                Step 2: Farm Details
              </h3>
              <p className="text-sm text-muted-foreground">
                Help us personalize your experience
              </p>
            </div>

            <div className="space-y-3">
              <Label>Primary Crop Types (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {cropOptions.map((crop) => (
                  <div key={crop.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={crop.id}
                      checked={cropTypes.includes(crop.id)}
                      onCheckedChange={(checked) =>
                        handleCropTypeChange(crop.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={crop.id}
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {crop.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="City, State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage} required>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select your language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hausa">Hausa</SelectItem>
                  <SelectItem value="yoruba">Yoruba</SelectItem>
                  <SelectItem value="igbo">Igbo</SelectItem>
                  <SelectItem value="pidgin">Nigerian Pidgin</SelectItem>
                  <SelectItem value="fulfulde">Fulfulde</SelectItem>
                  <SelectItem value="kanuri">Kanuri</SelectItem>
                  <SelectItem value="tiv">Tiv</SelectItem>
                  <SelectItem value="ijaw">Ijaw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
