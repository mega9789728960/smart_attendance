"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, getStoredUser } from "@/lib/api";

/* ────────────────────────── TYPES ────────────────────────── */

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  punch_in: string | null;
  punch_out: string | null;
  remark: string | null;
};

type TodayRecord = {
  id: string;
  punch_in: string | null;
  punch_out: string | null;
  remark: string | null;
};

type UserInfo = {
  name: string;
  employee_id: string;
  email: string;
  department: string;
  face_registered: boolean;
};

/* ────────────────────────── CONSTANTS ────────────────────────── */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Public holidays (add more as needed — format: "YYYY-MM-DD")
const PUBLIC_HOLIDAYS = new Set([
  "2026-01-26", "2026-03-14", "2026-04-14", "2026-05-01",
  "2026-08-15", "2026-10-02", "2026-11-01", "2026-12-25",
]);

/* ────────────────────────── HELPERS ────────────────────────── */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}



function formatTimeFull(isoString: string | null): string {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function calculateHoursWorked(punchIn: string | null, punchOut: string | null): string {
  if (!punchIn) return "—";
  const start = new Date(punchIn).getTime();
  const end = punchOut ? new Date(punchOut).getTime() : Date.now();
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

/* ────────────────────────── COMPONENT ────────────────────────── */

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const today = new Date();

  // Calendar state
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [calLoading, setCalLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

  // Today's punch state
  const [todayRecord, setTodayRecord] = useState<TodayRecord | null>(null);

  // Calendar detail popup
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  /* ── Init ── */
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (userInfo) {
      loadMonthData(currentYear, currentMonth);
    }
  }, [currentYear, currentMonth, userInfo]);



  async function init() {
    const token = getToken();
    const user = getStoredUser();
    if (!token || !user) { router.replace("/login"); return; }
    if (user.role === "admin") { router.replace("/dashboard"); return; }

    try {
      const me = await apiFetch("/api/auth/me");
      setUserInfo({
        name: me.name,
        employee_id: me.employee_id,
        email: me.email,
        department: me.department,
        face_registered: me.face_registered,
      });

      // Load today's record
      const todayData = await apiFetch("/api/attendance/my-today");
      if (todayData) setTodayRecord(todayData);
    } catch {
      router.replace("/login");
    }
  }

  async function loadMonthData(year: number, month: number) {
    setCalLoading(true);
    try {
      const data = await apiFetch(`/api/attendance/my-monthly?year=${year}&month=${month}`);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    }
    setCalLoading(false);
    setLoading(false);
  }

  /* ── Calendar Navigation ── */
  function goToPrevMonth() {
    setAnimDir("right");
    setTimeout(() => setAnimDir(null), 300);
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
  }

  function goToNextMonth() {
    const now = new Date();
    if (currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1) return;
    if (currentYear > now.getFullYear()) return;
    setAnimDir("left");
    setTimeout(() => setAnimDir(null), 300);
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
  }

  function goToCurrentMonth() {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  }

  /* ── Record map for quick lookups ── */
  const recordMap = new Map<string, AttendanceRecord>();
  records.forEach((r) => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    recordMap.set(key, r);
  });

  /* ── Calendar grid ── */
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  /* ── Stats ── */
  const totalWorkingDaysPassed = (() => {
    let count = 0;
    const now = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth - 1, d);
      if (date >= now) break;
      const day = date.getDay();
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (day !== 0 && day !== 6 && !PUBLIC_HOLIDAYS.has(dateStr)) count++;
    }
    return count;
  })();

  const presentCount = records.length;
  const lateCount = records.filter((r) => r.remark?.toLowerCase().includes("late") || r.remark?.toLowerCase().includes("half")).length;
  const absentCount = Math.max(0, totalWorkingDaysPassed - presentCount);
  const attendanceRate = totalWorkingDaysPassed > 0 ? Math.round((presentCount / totalWorkingDaysPassed) * 100) : 0;

  const isNextDisabled = (() => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
  })();

  /* ── Punch status ── */
  const hasPunchedIn = !!todayRecord?.punch_in;
  const hasPunchedOut = !!todayRecord?.punch_out;

  /* ── Handle date click on calendar ── */
  function handleDateClick(dateStr: string) {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setSelectedRecord(null);
    } else {
      setSelectedDate(dateStr);
      setSelectedRecord(recordMap.get(dateStr) || null);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <>
      <div className="pb-8 px-4 pt-4">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ───── HEADER ───── */}
          <div className="rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[#0e6b7a] to-[var(--primary-hover)] p-6 md:p-7 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Employee Dashboard</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Welcome back, {userInfo?.name?.split(" ")[0] || "Employee"} 👋
                </h1>
                <p className="text-white/70 text-sm mt-1 font-medium">
                  {userInfo?.department} · {userInfo?.employee_id}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* ───── MAIN GRID: HERO LEFT + CALENDAR RIGHT ───── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ════════ LEFT COLUMN: HERO SECTION ════════ */}
            <div className="lg:col-span-3 space-y-5">

              {/* ── PUNCH IN / PUNCH OUT BUTTONS ── */}
              <div className="card p-5 md:p-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Punch</h2>

                {hasPunchedIn && hasPunchedOut ? (
                  <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold text-sm bg-emerald-50 border border-emerald-200 px-5 py-4 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Shift Complete — See you tomorrow!
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push("/employee/punch")}
                      disabled={hasPunchedIn}
                      className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-200 ${
                        hasPunchedIn
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Punch In
                      </span>
                    </button>

                    <button
                      onClick={() => router.push("/employee/punch")}
                      disabled={!hasPunchedIn || hasPunchedOut}
                      className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-200 ${
                        !hasPunchedIn || hasPunchedOut
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Punch Out
                      </span>
                    </button>
                  </div>
                )}

                {/* Today's punch times */}
                {todayRecord?.punch_in && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-500 font-medium">In:</span>
                      <span className="font-bold text-slate-700">{formatTimeFull(todayRecord.punch_in)}</span>
                    </div>
                    {todayRecord.punch_out && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-slate-500 font-medium">Out:</span>
                        <span className="font-bold text-slate-700">{formatTimeFull(todayRecord.punch_out)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── STATS CARDS ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card p-4 text-center border-l-4 border-l-emerald-400 hover:scale-[1.02] transition-transform">
                  <div className="text-2xl font-extrabold text-emerald-500 tracking-tight">{presentCount}</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Present</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-red-400 hover:scale-[1.02] transition-transform">
                  <div className="text-2xl font-extrabold text-red-500 tracking-tight">{absentCount}</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Absent</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-amber-400 hover:scale-[1.02] transition-transform">
                  <div className="text-2xl font-extrabold text-amber-500 tracking-tight">{lateCount}</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Late</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-[var(--primary)] hover:scale-[1.02] transition-transform">
                  <div className="text-2xl font-extrabold text-[var(--primary)] tracking-tight">{attendanceRate}%</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Rate</p>
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: MINI CALENDAR ════════ */}
            <div className="lg:col-span-2 space-y-5">

              {/* ── CALENDAR CARD ── */}
              <div className="card p-4 md:p-5">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition-all text-slate-600 hover:text-[var(--primary)]"
                    aria-label="Previous month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                      {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </h2>
                    {(currentYear !== today.getFullYear() || currentMonth !== today.getMonth() + 1) && (
                      <button
                        onClick={goToCurrentMonth}
                        className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest mt-0.5 hover:underline"
                      >
                        Back to Today
                      </button>
                    )}
                  </div>

                  <button
                    onClick={goToNextMonth}
                    disabled={isNextDisabled}
                    className={`p-2 rounded-lg transition-all ${isNextDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100 active:scale-95 text-slate-600 hover:text-[var(--primary)]"}`}
                    aria-label="Next month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar loading spinner */}
                {calLoading && (
                  <div className="flex justify-center py-8">
                    <div className="w-7 h-7 border-3 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
                  </div>
                )}

                {/* Calendar Grid */}
                {!calLoading && (
                  <div
                    className={`transition-all duration-300 ease-out ${
                      animDir === "left" ? "animate-slide-in-left"
                        : animDir === "right" ? "animate-slide-in-right"
                        : ""
                    }`}
                  >
                    {/* Day Labels */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                      {DAY_LABELS.map((label) => (
                        <div
                          key={label}
                          className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider py-1"
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Day Cells */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }

                        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const dateObj = new Date(currentYear, currentMonth - 1, day);
                        const isToday = dateStr === todayStr;
                        const isFuture = dateObj > today;
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                        const isHoliday = PUBLIC_HOLIDAYS.has(dateStr);
                        const record = recordMap.get(dateStr);
                        const isPresent = !!record;
                        const isPast = !isFuture && !isToday;
                        const isLate = record?.remark?.toLowerCase().includes("late") || record?.remark?.toLowerCase().includes("half");
                        const isSelected = selectedDate === dateStr;

                        let bgClass = "";
                        let textClass = "text-slate-600";
                        let ringClass = "";
                        let dotColor = "";

                        if (isToday) {
                          bgClass = "bg-[var(--primary)]/10";
                          textClass = "text-[var(--primary)] font-extrabold";
                          ringClass = "ring-2 ring-[var(--primary)]/50";
                          if (isPresent) dotColor = isLate ? "bg-amber-400" : "bg-emerald-400";
                        } else if (isHoliday && !isFuture) {
                          bgClass = "bg-blue-50";
                          textClass = "text-blue-600 font-bold";
                          ringClass = "ring-1 ring-blue-200";
                          dotColor = "bg-blue-400";
                        } else if (isFuture || isWeekend) {
                          bgClass = "bg-slate-50/50";
                          textClass = isWeekend && isPast ? "text-slate-400" : "text-slate-300";
                        } else if (isPast && !isWeekend) {
                          if (isPresent) {
                            if (isLate) {
                              bgClass = "bg-amber-50";
                              textClass = "text-amber-700 font-bold";
                              ringClass = "ring-1 ring-amber-200";
                              dotColor = "bg-amber-400";
                            } else {
                              bgClass = "bg-emerald-50";
                              textClass = "text-emerald-700 font-bold";
                              ringClass = "ring-1 ring-emerald-200";
                              dotColor = "bg-emerald-400";
                            }
                          } else {
                            bgClass = "bg-red-50";
                            textClass = "text-red-600 font-bold";
                            ringClass = "ring-1 ring-red-200";
                            dotColor = "bg-red-400";
                          }
                        }

                        const isClickable = isPast && !isWeekend && !isHoliday;

                        return (
                          <div
                            key={dateStr}
                            onClick={() => isClickable && handleDateClick(dateStr)}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${bgClass} ${textClass} ${ringClass} relative ${
                              isClickable ? "cursor-pointer hover:scale-105 hover:shadow-md" : ""
                            } ${isSelected ? "ring-2 ring-[var(--primary)] scale-105 shadow-md" : ""}`}
                          >
                            <span className="text-xs leading-none">{day}</span>

                            {/* Status dot */}
                            {dotColor && (
                              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor}`} />
                            )}

                            {isToday && !dotColor && (
                              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[var(--primary)] animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Color Legend ── */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-200" />
                      Present
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block shadow-sm shadow-red-200" />
                      Absent
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-200" />
                      Late / Half Day
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block shadow-sm shadow-blue-200" />
                      Public Holiday
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SELECTED DATE DETAILS CARD ── */}
              {selectedDate && (
                <div className="card p-4 md:p-5 animate-fade-in border-l-4 border-l-[var(--primary)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <button
                      onClick={() => { setSelectedDate(null); setSelectedRecord(null); }}
                      className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {selectedRecord ? (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Punch In</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md text-xs">
                          {formatTimeFull(selectedRecord.punch_in)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Punch Out</span>
                        <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md text-xs">
                          {formatTimeFull(selectedRecord.punch_out)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Hours Worked</span>
                        <span className="font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-0.5 rounded-md text-xs">
                          {calculateHoursWorked(selectedRecord.punch_in, selectedRecord.punch_out)}
                        </span>
                      </div>
                      {selectedRecord.remark && (
                        <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-100">
                          <span className="text-slate-500 font-medium">Remark</span>
                          <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md text-xs capitalize">
                            {selectedRecord.remark}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <div className="text-2xl opacity-40 mb-1">✗</div>
                      <p className="text-sm text-red-500 font-semibold">Absent</p>
                      <p className="text-xs text-slate-400 mt-0.5">No attendance record for this day</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style jsx>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
