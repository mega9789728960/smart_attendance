"use client";

import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function clientAction(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    const result = await login(formData);
    if (result?.error) {
      setErrorMsg(result.error);
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
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="w-[120px] h-[120px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 duration-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Smart<span className="text-[var(--primary)]">Attendance</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Secure Admin & Emloyee Portal
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] p-3 rounded-xl text-sm font-semibold text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        <form action={clientAction} className="space-y-4">
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
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full bg-white border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] outline-none transition-all placeholder-slate-400 text-slate-900 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full py-3.5 text-base mt-2 shadow-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
