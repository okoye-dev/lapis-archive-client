import { getApiBaseUrl } from "./api-service";
import { SignupData } from "@/store/authStore";

export interface SigninResponse {
  user: {
    id: string;
    username: string;
    created_at: string;
  };
  access_token: string;
  token_type: string;
  expires_in: number;
  message: string;
}

export interface SignupResponse {
  user: {
    id: string;
    username: string;
    created_at: string;
  };
  access_token: string;
  token_type: string;
  expires_in: number;
  message: string;
}

class AuthService {
  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  async signup(data: SignupData): Promise<SignupResponse> {
    const baseUrl = this.getBaseUrl();
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
      throw new Error(errorData.message || "Failed to sign up");
    }

    return response.json();
  }

  async signin(username: string, password: string): Promise<SigninResponse> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to sign in");
    }

    return response.json();
  }

  async getProfile(accessToken: string): Promise<any> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    return response.json();
  }
}

export const authService = new AuthService();

