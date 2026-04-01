"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/app/components/MobileBottomNav";

type Attendance = {
  id: string;
  date: string;
  status: string | null;
  punch_in?: string | null;
  remark?: string | null;
};

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [faceRegistered, setFaceRegistered] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);


    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("employee_id, face_descriptor, role")
      .eq("auth_user_id", user.id)
      .single();

    if (empError || !employee) {
      router.replace("/login");
      return;
    }

    if (employee.role === "admin") {
      router.replace("/dashboard");
      return;
    }

    setFaceRegistered(
      Array.isArray(employee.face_descriptor) &&
        employee.face_descriptor.length > 0
    );

    const { data } = await supabase
      .from("attendance")
      .select("id, date, status, punch_in, remark")
      .eq("employee_id", employee.employee_id)
      .order("date", { ascending: false });

    setRecords(data || []);
    setLoading(false);
  }

  return (
    <>
      <div className="pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] p-8 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight">
                My Attendance
              </h1>
              <p className="text-[var(--primary-light)] text-sm mt-1.5 font-medium">
                View your daily attendance history
              </p>
            </div>
          </div>

          {/* FACE WARNING */}
          {!faceRegistered && !loading && (
            <div className="mb-5 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 p-5 text-[var(--warning)] text-sm font-semibold flex items-start shadow-sm">
              <span className="text-lg mr-3 leading-none">⚠️</span>
              <div>
                Face not registered.
                <br className="my-1"/>
                <span className="font-normal opacity-90">Please contact admin to complete face registration.</span>
              </div>
            </div>
          )}

          {/* CONTENT CARD */}
          <div className="card p-6">
            {loading && (
              <p className="text-center text-slate-500 py-8 font-medium">
                Loading attendance history…
              </p>
            )}

            {!loading && records.length === 0 && (
              <div className="text-center py-10">
                <div className="text-4xl mb-3 opacity-50">📅</div>
                <p className="text-slate-500 font-medium">
                  No attendance records found
                </p>
              </div>
            )}

            {!loading && records.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Punch In</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors last:border-0"
                      >
                        <td className="p-4 font-semibold text-slate-700">
                          {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {r.punch_in
                            ? new Date(r.punch_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                            : "—"}
                        </td>
                        <td className="p-4">
                          <span className="badge badge-success capitalize">
                            {r.status ?? "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          {r.remark ? (
                            <span className="badge badge-primary">{r.remark}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
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

      <MobileBottomNav />
    </>
  );
}
