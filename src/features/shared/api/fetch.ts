export async function apiFetch(input: string, init: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const url = input.startsWith("http") ? input : `${baseUrl}${input}`;

  const headers = new Headers(init.headers);

  // Example: bearer token (replace with your real token source)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  // If your API sometimes returns empty body:
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return res.text();

  return res.json();
}
