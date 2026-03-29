import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e27c0db5`;

export async function apiRequest<T = unknown>(
  path: string,
  options?: RequestInit,
  retries = 2
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...(options?.headers ?? {}),
    },
  };

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Small delay on retry (cold start warm-up)
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }

      const res = await fetch(url, fetchOptions);

      // Parse response body
      let data: unknown;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text || `HTTP ${res.status}` };
        }
      }

      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }

      return data as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const isNetworkError =
        lastError.message === "Failed to fetch" ||
        lastError.message.includes("NetworkError") ||
        lastError.message.includes("network") ||
        lastError.message.includes("fetch");

      // Only retry on network/connection errors, not on business logic errors
      if (!isNetworkError || attempt >= retries) {
        // Give a clearer message for network errors
        if (isNetworkError) {
          throw new Error(
            "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
          );
        }
        throw lastError;
      }

      console.log(`apiRequest retry ${attempt + 1}/${retries} for ${path}:`, lastError.message);
    }
  }

  throw lastError;
}
