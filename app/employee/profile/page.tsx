"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/app/components/MobileBottomNav";

type Employee = {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  role: string;
};

export default function EmployeeProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    // 1️⃣ Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    // 2️⃣ Fetch employee data using auth_user_id
    const { data, error } = await supabase
      .from("employees")
      .select("employee_id, name, email, department, role")
      .eq("auth_user_id", user.id)
      .single();

    if (error) {
      console.error(error);
      setError("Failed to load profile");
    } else {
      setEmployee(data);
    }

    setLoading(false);
  }

  return (
    <div className="px-4 py-8 pb-24">
      <div className="max-w-md mx-auto card p-8 space-y-6">
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="mx-auto w-20 h-20 bg-[var(--primary-light)] text-[var(--primary)] rounded-full flex items-center justify-center mb-4 shadow-sm">
             <span className="text-4xl drop-shadow-sm">🧑‍💼</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--primary)] tracking-tight">
            My Profile
          </h1>
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-4 font-medium animate-pulse">Loading profile…</p>
        )}

        {error && (
          <div className="bg-[var(--error)]/10 text-[var(--error)] p-3 rounded-lg text-sm text-center font-semibold border border-[var(--error)]/20 shadow-sm">
            {error}
          </div>
        )}

        {employee && (
          <div className="space-y-4 text-sm mt-4">
            <ProfileRow label="Employee ID" value={employee.employee_id} />
            <ProfileRow label="Name" value={employee.name} />
            <ProfileRow label="Email" value={employee.email} />
            <ProfileRow label="Department" value={employee.department} />
            <ProfileRow label="Role" value={employee.role} isRole={true} />
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}

/* ---------- SMALL HELPER COMPONENT ---------- */
function ProfileRow({
  label,
  value,
  isRole = false
}: {
  label: string;
  value: string;
  isRole?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 font-medium">{label}</span>
      {isRole ? (
        <span className="badge badge-primary uppercase text-[10px] tracking-widest">{value}</span>
      ) : (
        <span className="font-bold text-slate-800 tracking-tight">{value}</span>
      )}
    </div>
  );
}
