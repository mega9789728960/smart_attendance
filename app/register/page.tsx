"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState("");

  async function generateEmployeeId() {
    const { data } = await supabase
      .from("employees")
      .select("employee_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!data?.employee_id) return "EMP001";

    const match = data.employee_id.match(/\d+/);
    if (!match) {
      // Fallback if the previous row has no numbers in the ID (e.g. "EMPNaN", "Admin")
      return `EMP${Math.floor(Math.random() * 900) + 100}`;
    }

    const last = parseInt(match[0], 10);
    return `EMP${String(last + 1).padStart(3, "0")}`;
  }

  async function handleRegister() {
    if (!name || !email || !password || !department) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } =
      await supabase.auth.signUp({ email, password });

    if (authError || !authData.user) {
      setLoading(false);
      alert(authError?.message || "Registration failed");
      return;
    }

    const employeeId = await generateEmployeeId();

    const { error: empError } = await supabase.from("employees").insert({
      employee_id: employeeId,
      name,
      email,
      department,
      role: "employee",
      auth_user_id: authData.user.id,
    });

    setLoading(false);

    if (empError) {
      console.error("Employee insert failed:", empError);
      alert(`Employee creation failed: ${empError.message}`);
      return;
    }

    setGeneratedEmployeeId(employeeId);
    setSuccess(true);
  }

  /* ---------- SUCCESS SCREEN ---------- */
  if (success) {
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
          <div className="flex justify-center mb-5">
            <img src="/logo.png" alt="Logo" className="w-[120px] h-[120px] object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Register a new employee profile</p>
        </div>

        <div className="space-y-5">
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
            onClick={handleRegister}
            disabled={loading}
            className={`btn btn-primary w-full py-3.5 text-base mt-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? "Creating Profile..." : "Register Employee"}
          </button>
        </div>
      </div>
    </main>
  );
}
