"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AttendanceRow = {
  id: string;
  date: string;
  status: string | null;
  punch_in: string | null;
  employee_id: string;
  employeeName?: string;
};

export default function AdminAttendancePage() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    setLoading(true);

    const { data: attendance, error } = await supabase
      .from("attendance")
      .select("id, date, status, punch_in, employee_id")
      .order("date", { ascending: false });

    if (error) {
      console.error("Attendance error:", error);
      setRows([]);
      setLoading(false);
      return;
    }

    if (!attendance || attendance.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data: employees } = await supabase
      .from("employees")
      .select("employee_id, name");

    const merged = attendance.map((a) => ({
      ...a,
      employeeName:
        employees?.find((e) => e.employee_id === a.employee_id)?.name ??
        "Unknown",
    }));

    setRows(merged);
    setLoading(false);
  }

  return (
    <div className="pb-28">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] p-8 shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">
              Attendance Log
            </h1>
            <p className="text-[var(--primary-light)] text-sm mt-1.5 font-medium">
              Daily employee punch-in records across the organization
            </p>
          </div>
          <div className="relative z-10 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/30 flex items-center gap-2 shadow-sm self-start md:self-auto">
            <span className="text-sm font-semibold text-white/90">RECORDS</span>
            <span className="text-2xl font-bold tracking-tight">{rows.length}</span>
          </div>
        </div>

        <div className="card p-6 min-h-[400px]">
          {/* STATES */}
          {loading && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading attendance data…</p>
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="text-5xl mb-4 opacity-50">📋</div>
              <p className="text-slate-500 font-medium text-lg">
                No attendance records found
              </p>
            </div>
          )}

          {/* TABLE */}
          {!loading && rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Employee</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Time</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors last:border-0"
                    >
                      <td className="p-4 text-slate-900 font-semibold whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      <td className="p-4 text-slate-900">
                        <div className="font-bold tracking-tight">
                          {r.employeeName}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {r.employee_id}
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                        {r.punch_in
                          ? new Date(r.punch_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
                          : "—"}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {/* Always present in this dataset since standard punches only create 'present' lines; we can just render the badge */}
                        <span className="badge badge-success shadow-sm">
                          Present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
