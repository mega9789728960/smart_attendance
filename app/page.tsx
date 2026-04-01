"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* ================= HEADER (GLASSMORPHISM) ================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-2">
          {/* LOGO AND BRANDING */}
          <div className="flex items-center gap-2 sm:gap-4 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 shrink-0">
            <img src="/logo.png" alt="Logo" className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
            <span className="hidden min-[400px]:inline-block">Smart <span className="text-[var(--primary)]">Attendance</span></span>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">How it Works</a>
            <a href="#admin" className="hover:text-[var(--primary)] transition-colors">Admin</a>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold text-slate-700 hover:text-[var(--primary)] transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="btn btn-primary px-4 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm shadow-md whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        {/* Abstract Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)]/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold tracking-wide mb-8 border border-[var(--primary)]/20 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            Meet the Future of Work
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-slate-900">
            Next-Gen Attendance <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-transparent bg-clip-text">
              Powered by AI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 font-medium leading-relaxed">
            Eliminate buddy punching and manual entry. Secure, frictionless facial recognition coupled with geo-fencing for modern, remote-ready teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="btn btn-primary px-8 py-4 text-base w-full sm:w-auto shadow-lg shadow-[var(--primary)]/30"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl font-bold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-base w-full sm:w-auto shadow-sm"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[var(--primary)] font-bold tracking-widest text-sm uppercase mb-3">Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Everything you need to manage attendance</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: "Face Recognition", icon: "🙂", desc: "Anti-spoofing AI verifies employee identity in milliseconds." },
              { title: "GPS Geo‑Fencing", icon: "📍", desc: "Lock punches to specific campus locations dynamically." },
              { title: "Real‑Time Data", icon: "📊", desc: "Live dashboard with instant synchronization." },
              { title: "Cloud Native", icon: "☁️", desc: "Secure, scalable infrastructure accessible anywhere." },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200/60 p-8 rounded-3xl text-center shadow-md hover:shadow-2xl hover:shadow-[var(--primary)]/10 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 text-[var(--primary)] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-xl text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-700 text-base font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[var(--primary)] font-bold tracking-widest text-sm uppercase mb-3">Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Frictionless in three steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent -translate-y-1/2 z-0"></div>

            {[
              { step: "1", title: "Access System", desc: "User opens app & grants secure perimeter access." },
              { step: "2", title: "Dual Verification", desc: "Instant AI face check + GPS boundary validation." },
              { step: "3", title: "Auto-Logged", desc: "Attendance marked and synced to the cloud." },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white p-8 rounded-3xl shadow-md border border-slate-200/60 text-center relative z-10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-[var(--primary)]/40 group-hover:scale-110 transition-transform">
                  {s.step}
                </div>
                <h4 className="font-extrabold text-slate-900 text-xl mb-3">{s.title}</h4>
                <p className="text-slate-700 text-base font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-50 border-y border-slate-200">
        {/* Subtle background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight">
            Ready to modernize your team?
          </h2>
          <p className="text-slate-600 text-lg md:text-2xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Join forward-thinking companies securing their attendance infrastructure with AI-driven insights.
          </p>

          <Link
            href="/login"
            className="btn btn-primary px-12 py-5 rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--primary)]/20 transition-all duration-300"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 text-center border-t border-slate-100 bg-white">
        <div className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-slate-900 mb-6 opacity-60 hover:opacity-100 transition-all">
          <img src="/logo.png" alt="Logo" className="w-[60px] h-[60px] object-contain" />
          SmartAttendance
        </div>
        <p className="text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} Smart Attendance System. All rights reserved.
        </p>
      </footer>
    </main>
  );
}