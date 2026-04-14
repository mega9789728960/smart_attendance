"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/api";

export default function AttendanceRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role === "admin") {
      router.replace("/dashboard");
    } else {
      router.replace("/employee/punch");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Redirecting…</p>
      </div>
    </div>
  );
}
