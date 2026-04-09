"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken, setStoredUser } from "@/lib/api";

export default function AdminLoginPage() {
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
      setErrorMsg("Enter admin email and password");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setStoredUser(data.user);

      router.replace("/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Admin login failed");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-900">
      {/* Decorative background gradients for Admin */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md card bg-slate-800/90 border border-slate-700 space-y-6 relative z-10 p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="w-[100px] h-[100px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Admin<span className="text-indigo-400">Portal</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2">
            Secure Management Access
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-semibold text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Admin Email"
              required
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 text-white shadow-inner"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 text-white shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-base mt-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? "Authenticating..." : "Sign In to Workspace"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">
            Return to Employee Portal
          </a>
        </div>
      </div>
    </main>
  );
}
