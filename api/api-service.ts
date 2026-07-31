import { useAuthStore } from "@/store/authStore";

type RequestOptions = {
  params?: Record<string, string | number>;
  body?: object;
  headers?: Record<string, string>;
  query?: Record<string, string>;
};

export const getApiBaseUrl = () => {
  // Use the environment variable regardless of NODE_ENV
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
};

class ApiService {
  private apiPath: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    const baseUrl = this.getBaseUrl();
    this.apiPath = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  private getHeaders(): Record<string, string> {
    const user = useAuthStore.getState().user;
    return {
      ...this.defaultHeaders,
      Authorization: `Bearer ${user?.access_token}`,
    };
  }

  private formatUrl(path: string, options?: RequestOptions): string {
    let url = path;

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url = url.replace(`:${key}`, String(value));
      }
    }

    if (options?.query) {
      const queryString = new URLSearchParams(options.query).toString();
      url = `${url}${queryString ? `?${queryString}` : ""}`;
    }

    return `${this.apiPath}${url}`;
  }

  // Generic request method
  private async request<T>(
    method: string,
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.formatUrl(path, options);
    let headers = { ...this.getHeaders(), ...options?.headers };

    let response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle 401 Unauthorized - token refresh
    if (response.status === 401) {
      try {
        const refreshSuccess = await useAuthStore.getState().refreshToken();

        if (refreshSuccess) {
          // Retry the original request with new token
          const retryResponse = await fetch(url, {
            method,
            headers: {
              ...this.getHeaders(),
              ...options?.headers,
            },
            body: options?.body ? JSON.stringify(options.body) : undefined,
          });
          return await retryResponse.json();
        } else {
          // Token refresh failed, user will be signed out
          useAuthStore.getState().signOut();
          throw new Error("Authentication failed");
        }
      } catch (refreshError) {
        useAuthStore.getState().signOut();
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      // Try to get error message from response body
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as T;
  }

  // HTTP method wrappers
  public async get<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return this.request<T>("GET", path, options);
  }

  public async post<T>(path: string, options?: RequestOptions) {
    return this.request<T>("POST", path, options);
  }

  public async put<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PUT", path, options);
  }

  public async patch<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PATCH", path, options);
  }

  public async delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}

export const apiService = new ApiService();
