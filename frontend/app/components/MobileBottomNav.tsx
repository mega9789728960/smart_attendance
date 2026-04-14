"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, removeToken } from "@/lib/api";

type Role = "admin" | "employee";

export default function MobileBottomNav() {
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setRole(user.role as Role);
    }
  }, []);

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  if (!role) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)] shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.05)] pb-safe-area">
      <div className="flex justify-around py-3 px-2 text-[10px] font-bold tracking-wide text-slate-500 uppercase">

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            <Link href="/dashboard" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95">
              <span className="text-2xl drop-shadow-sm">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link href="/employees" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95">
              <span className="text-2xl drop-shadow-sm">👥</span>
              <span>Employees</span>
            </Link>

            <Link href="/register" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95">
              <span className="text-2xl drop-shadow-sm">🧑‍💼</span>
              <span>Register</span>
            </Link>

            <Link
              href="/dashboard/attendance"
              className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95"
            >
              <span className="text-2xl drop-shadow-sm">📋</span>
              <span>Logs</span>
            </Link>
          </>
        )}

        {/* ================= EMPLOYEE ================= */}
        {role === "employee" && (
          <>
            <Link href="/employee/dashboard" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95">
              <span className="text-2xl drop-shadow-sm">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link href="/employee/punch" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95">
              <span className="text-2xl drop-shadow-sm">🕒</span>
              <span>Punch</span>
            </Link>

            <Link
              href="/employee/attendance"
              className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95"
            >
              <span className="text-2xl drop-shadow-sm">📄</span>
              <span>History</span>
            </Link>

            <Link
              href="/employee/profile"
              className="flex flex-col items-center gap-1.5 transition-colors hover:text-[var(--primary)] active:scale-95"
            >
              <span className="text-2xl drop-shadow-sm">👤</span>
              <span>Profile</span>
            </Link>

            {/* ✅ LOGOUT */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-[var(--error)] transition-colors active:scale-95"
            >
              <span className="text-2xl drop-shadow-sm opacity-80">🚪</span>
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
