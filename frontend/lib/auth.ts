import { apiFetch, getToken, getStoredUser } from "@/lib/api";

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const user = await apiFetch('/api/auth/me');
    return user;
  } catch {
    return null;
  }
}

export function getUserRole(): string {
  const user = getStoredUser();
  if (!user) return "employee";
  return user.role || "employee";
}

