import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign In - Lapis Archive",
  description: "Sign in to your Lapis Archive account",
};

export default function SigninLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div lang="en">
      <div className="overflow-x-hidden leading-[1.25rem] text-black">
        {children}
      </div>
    </div>
  );
}
