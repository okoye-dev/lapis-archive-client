import { create } from "zustand";
import { persist } from "zustand/middleware";

// A signed-in Supabase session. We keep just enough to attach the bearer token
// to API calls and show who's signed in. Persisted so a reload stays signed in.
export interface Session {
  accessToken: string;
  refreshToken?: string;
  email: string;
  userId: string;
}

interface AuthState {
  session: Session | null;

  // Actions
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => void;
  // Getter the api-service uses to attach Authorization on each request.
  getAccessToken: () => string | null;
}

// Both are safe to expose to the browser (that's why they're NEXT_PUBLIC_).
// Read lazily so a missing config produces a clear error at call time rather
// than firing a request at "undefined/auth/v1/...".
const getSupabaseConfig = (): { url: string; key: string } => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Login isn't configured yet");
  }
  return { url, key };
};

// Pull a human-readable message out of a GoTrue error response.
const extractError = async (response: Response): Promise<string | null> => {
  try {
    const data = await response.json();
    return (
      data.error_description || data.msg || data.message || data.error || null
    );
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,

      sendOtp: async (email: string) => {
        const { url, key } = getSupabaseConfig();
        const response = await fetch(`${url}/auth/v1/otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: key,
          },
          body: JSON.stringify({ email, create_user: true }),
        });

        if (!response.ok) {
          const message = await extractError(response);
          throw new Error(
            message || "Couldn't send the code. Please try again.",
          );
        }
      },

      verifyOtp: async (email: string, token: string) => {
        const { url, key } = getSupabaseConfig();
        const response = await fetch(`${url}/auth/v1/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: key,
          },
          body: JSON.stringify({ email, token, type: "email" }),
        });

        if (!response.ok) {
          const message = await extractError(response);
          throw new Error(
            message || "That code didn't work. Please try again.",
          );
        }

        const data = await response.json();
        set({
          session: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            email: data.user.email,
            userId: data.user.id,
          },
        });
      },

      signOut: () => {
        set({ session: null });
      },

      getAccessToken: () => get().session?.accessToken ?? null,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
