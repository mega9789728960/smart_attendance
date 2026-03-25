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
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance History
          </h1>
          <p className="text-sm text-slate-600">
            Daily employee punch-in records
          </p>
        </div>

        {/* STATES */}
        {loading && (
          <p className="text-slate-600 font-medium">Loading attendance…</p>
        )}

        {!loading && rows.length === 0 && (
          <p className="text-slate-600 font-medium">
            No attendance records found
          </p>
        )}

        {/* TABLE */}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200">
            <table className="w-full text-sm sm:text-base">
              <thead className="bg-slate-200 text-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Punch In
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {new Date(r.date).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-slate-900">
                      <div className="font-semibold">
                        {r.employeeName}
                      </div>
                      <div className="text-xs text-slate-600">
                        {r.employee_id}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {r.punch_in
                        ? new Date(r.punch_in).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
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
  );
}
