import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserRole(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_user_id", userId)
    .single();
    
  if (error || !data) return "employee";
  return data.role || "employee";
}
