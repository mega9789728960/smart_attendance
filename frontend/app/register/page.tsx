"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Step = "FORM" | "OTP" | "SUCCESS";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("FORM");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [generatedEmployeeId, setGeneratedEmployeeId] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (!name || !email || !password || !department) {
      setErrorMsg("All fields are required");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = await apiFetch("/api/auth/register-send-otp", {
        method: "POST",
        body: JSON.stringify({ name, email, password, department }),
      });

      setToken(data.token);
      setSuccessMsg("OTP sent to your email!");
      setStep("OTP");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send OTP");
    }

    setLoading(false);
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (!otp) {
      setErrorMsg("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ token, otp }),
      });

      setGeneratedEmployeeId(data.employee_id);
      setStep("SUCCESS");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Verification failed. Check your OTP.");
    }

    setLoading(false);
  }

  /* ---------- SUCCESS SCREEN ---------- */
  if (step === "SUCCESS") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[var(--success)]/10 to-transparent pointer-events-none" />
        <div className="w-full max-w-md card bg-white/90 text-center p-10 relative z-10 space-y-6">
          <div className="mx-auto w-20 h-20 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-[var(--success)] mb-1 tracking-tight">
              Registration Successful
            </h1>
            <p className="text-slate-500 text-sm font-medium">Your Employee Profile is ready.</p>
          </div>

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-left flex items-start shadow-sm mt-8">
            <span className="mr-4 text-3xl leading-none drop-shadow-sm pb-1">⚠️</span>
            <div>
              <p className="text-sm text-amber-900 font-extrabold mb-1 uppercase tracking-wide">Action Required</p>
              <p className="text-[13px] text-amber-800 font-semibold leading-relaxed">
                Please register your face by contacting your Admin before you can punch attendance.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.replace("/login")}
            className="btn btn-primary w-full py-3.5 text-base"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  /* ---------- REGISTER FORM ---------- */
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md card bg-white/90 relative z-10 p-8">
        <div className="text-center mb-6">

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Register a new employee profile</p>
        </div>

        {errorMsg && (
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] p-3 rounded-xl text-sm font-semibold text-center shadow-sm mb-4">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] p-3 rounded-xl text-sm font-semibold text-center shadow-sm mb-4">
            {successMsg}
          </div>
        )}

        {step === "FORM" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <input
                placeholder="Full Name"
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <input
                placeholder="Department (e.g., Engineering)"
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full py-3.5 text-base mt-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? "Sending Verification..." : "Continue"}
            </button>
            <div className="text-center pt-2">
              <a href="/login" className="text-sm font-medium text-[var(--primary)] hover:underline">
                Already have an account? Login
              </a>
            </div>
          </form>
        )}

        {step === "OTP" && (
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                className="w-full border border-slate-300/80 rounded-xl px-5 py-4 text-base font-medium text-center tracking-widest focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all placeholder-slate-400 bg-white shadow-sm text-slate-900"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-success w-full py-3.5 text-base mt-2 transition-all text-white bg-[var(--success)] shadow-sm hover:shadow-md ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
