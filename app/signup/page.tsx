"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Signing up and signing in are the same passwordless Email OTP flow now, so
// /signup just forwards to /signin (kept so existing links don't 404).
const SignUp = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signin");
  }, [router]);

  return null;
};

export default SignUp;
