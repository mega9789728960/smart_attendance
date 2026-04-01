"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="w-full h-full p-6 flex flex-col space-y-2">
      <div className="flex items-center gap-3 mb-10 px-2 mt-4">
        <img src="/logo.png" alt="Logo" className="w-[48px] h-[48px] object-contain drop-shadow-sm" />
        <h1 className="text-xl font-bold tracking-tight leading-tight">
          Smart<br/>Attendance
        </h1>
      </div>

      <nav className="space-y-2 text-sm flex-1">
        {/* ADMIN */}
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-6 mb-3 px-2">Admin Panel</p>

        <Link href="/dashboard" className="block">
          Dashboard
        </Link>

        <Link href="/dashboard/attendance" className="block">
          Attendance
        </Link>

        <Link href="/employees" className="block">
          Employees
        </Link>

        <Link href="/register" className="block">
          Register
        </Link>
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full text-slate-300 hover:text-white bg-slate-800 hover:bg-[var(--error)] py-3 rounded-xl text-sm font-semibold transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
}
