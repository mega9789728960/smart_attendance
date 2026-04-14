"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken, setStoredUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setErrorMsg("Enter email and password");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/auth/employee-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setStoredUser(data.user);

      router.replace("/employee/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Login failed");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--success)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md card bg-white/90 space-y-6 relative z-10 p-8">
        <div className="text-center">

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Smart<span className="text-[var(--primary)]">Attendance</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Secure Admin &amp; Employee Portal
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] p-3 rounded-xl text-sm font-semibold text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="w-full bg-white border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] outline-none transition-all placeholder-slate-400 text-slate-900 shadow-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700 sr-only">Password</label>
            </div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full bg-white border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] outline-none transition-all placeholder-slate-400 text-slate-900 shadow-sm"
            />
            <div className="flex justify-end mt-2">
              <a href="/forgot-password" className="text-sm text-[var(--primary)] font-medium hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full py-3.5 text-base mt-2 shadow-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <a href="/register" className="font-semibold text-[var(--primary)] hover:underline">
              Register here
            </a>
          </p>
          <a href="/admin/login" className="block text-sm font-medium text-slate-500 hover:text-[var(--primary)] transition-colors">
            Admin Portal Access
          </a>
        </div>
      </div>
    </main>
  );
}
