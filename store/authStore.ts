import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getApiBaseUrl } from "@/api/api-service";
import { User } from "@/types/types";

export interface SignupData {
  username: string;
  password: string;
  phone_number?: string;
  location_id?: number;
  language?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signUp: (data: SignupData) => Promise<boolean>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
  refreshToken: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signUp: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetch(`${baseUrl}/auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to sign up. Please try again."
            );
          }

          const responseData = await response.json();
          
          set({
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred during sign up";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      signIn: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetch(`${baseUrl}/auth/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to sign in. Please try again."
            );
          }

          const data = await response.json();
          const user: User = {
            id: data.user?.id || data.id,
            email: data.user?.username || data.username,
            name: data.user?.username || data.username,
            access_token: data.access_token || data.accessToken,
            refresh_token: data.refresh_token || data.refreshToken || "",
            token_expiry: data.expires_in || data.expiresIn,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred during sign in";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { user } = get();
        if (!user?.refresh_token) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetch(`${baseUrl}/v1/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: user.refresh_token }),
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();
          const updatedUser: User = {
            ...user,
            access_token: data.access_token || data.accessToken,
            refresh_token: data.refresh_token || data.refreshToken || user.refresh_token,
            token_expiry: data.token_expiry || data.expiresIn,
          };

          set({
            user: updatedUser,
            isAuthenticated: true,
            error: null,
          });

          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);
          set({
            user: null,
            isAuthenticated: false,
            error: "Session expired. Please sign in again.",
          });
          return false;
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

