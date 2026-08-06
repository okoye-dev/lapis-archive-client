import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign Up - Lapis Archive",
  description: "Create your account on Lapis Archive",
};

export default function SignupLayout({
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
