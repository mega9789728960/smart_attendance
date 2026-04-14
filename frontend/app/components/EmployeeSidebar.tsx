"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/api";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/employee/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/employee/punch",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/employee/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  return (
    <div className="w-full h-full p-6 flex flex-col">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 mb-10 px-2 mt-4">
        <h1 className="text-xl font-bold tracking-tight leading-tight">
          Smart<br/>Attendance
        </h1>
      </div>

      {/* ── Section Label ── */}
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3 px-2">
        Employee Panel
      </p>

      {/* ── Nav Items ── */}
      <nav className="space-y-1 text-sm flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[var(--primary)]/15 text-white border-l-[3px] border-l-[var(--primary)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <span className={`transition-colors duration-200 ${isActive ? "text-[var(--primary)]" : "text-slate-500 group-hover:text-[var(--primary)]"}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full text-slate-300 hover:text-white bg-slate-800 hover:bg-[var(--error)] py-3 rounded-xl text-sm font-semibold transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
}
