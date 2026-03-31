"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/auth";

type Role = "admin" | "employee";

export default function MobileBottomNav() {
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadRole();
  }, []);

  async function loadRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // ✅ DB ROLE CHECK
    const dbRole = await getUserRole(user.id);
    setRole(dbRole as Role);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!role) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-blue-100 shadow-lg">
      <div className="flex justify-around py-2 text-xs font-medium text-blue-700">

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            <Link href="/dashboard" className="flex flex-col items-center gap-1">
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link href="/employees" className="flex flex-col items-center gap-1">
              <span className="text-lg">👥</span>
              <span>Employees</span>
            </Link>

            <Link href="/register" className="flex flex-col items-center gap-1">
              <span className="text-lg">🧑‍💼</span>
              <span>Register</span>
            </Link>

            <Link
              href="/dashboard/attendance"
              className="flex flex-col items-center gap-1"
            >
              <span className="text-lg">📋</span>
              <span>Attendance</span>
            </Link>
          </>
        )}

        {/* ================= EMPLOYEE ================= */}
        {role === "employee" && (
          <>
            <Link href="/attendance" className="flex flex-col items-center gap-1">
              <span className="text-lg">🕒</span>
              <span>Punch</span>
            </Link>

            <Link
              href="/employee/attendance"
              className="flex flex-col items-center gap-1"
            >
              <span className="text-lg">📄</span>
              <span>History</span>
            </Link>

            <Link
              href="/employee/profile"
              className="flex flex-col items-center gap-1"
            >
              <span className="text-lg">👤</span>
              <span>Profile</span>
            </Link>

            {/* ✅ LOGOUT */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 text-red-600"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
