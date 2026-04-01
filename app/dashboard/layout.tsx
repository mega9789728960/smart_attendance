"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex sidebar">
        <Sidebar />
      </aside>

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <aside className="sidebar">
            <Sidebar />
          </aside>

          {/* Overlay */}
          <div
            className="flex-1 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col relative w-full">

        {/* ================= MOBILE TOP BAR ================= */}
        <div className="md:hidden topbar">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex items-center gap-2 translate-x-1">
            <img src="/logo.png" alt="Logo" className="w-[32px] h-[32px] object-contain drop-shadow-sm" />
            <span className="font-bold text-slate-900 text-lg tracking-tight hidden sm:inline-block">
              Smart<span className="text-[var(--primary)]">Attendance</span>
            </span>
          </div>

          <button
            onClick={logout}
            className="text-sm font-semibold text-[var(--error)] bg-[var(--error)]/10 px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--error)] hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
