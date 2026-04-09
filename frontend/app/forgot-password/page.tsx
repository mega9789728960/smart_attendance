"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Step = "EMAIL" | "OTP" | "PASSWORD";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("EMAIL");
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  
  const [token, setToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setToken(data.token);
      setStep("OTP");
      setSuccessMsg("OTP sent to your email!");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send email");
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ token, code: otp }),
      });
      setToken(data.token);
      setStep("PASSWORD");
      setSuccessMsg("OTP Verified! Enter new password.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid or expired OTP");
    }
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setStep("EMAIL");
      setSuccessMsg("Password reset successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reset password");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md card bg-white/90 relative z-10 p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Forgot Password
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Follow the steps to reset your password</p>
        </div>

        {errorMsg && (
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] p-3 rounded-xl text-sm font-semibold text-center mt-4">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] p-3 rounded-xl text-sm font-semibold text-center mt-4">
            {successMsg}
          </div>
        )}

        <div className="mt-6">
          {step === "EMAIL" && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full py-3.5 text-base mt-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium text-center tracking-widest focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full py-3.5 text-base mt-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "PASSWORD" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="Enter new password"
                required
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full py-3.5 text-base mt-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm font-medium text-[var(--primary)] hover:underline transition-colors">
            Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}
