"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/app/components/MobileBottomNav";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

/* ---------- TYPES ---------- */
type TodayAttendance = {
  id: string;
  employee_id: string;
  punch_in: string | null;
  remark: string | null;
  employee_name?: string;
};

type DeptStat = {
  department: string;
  present: number;
  absent: number;
};

/* ---------- STAT CARD ---------- */
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="card p-6 flex flex-col justify-center">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

/* ---------- BADGE (REMARK BASED) ---------- */
function StatusBadge({ remark }: { remark: string | null }) {
  if (!remark)
    return (
      <span className="badge bg-slate-100 text-slate-500">
        —
      </span>
    );

  switch (remark) {
    case "On Time":
      return <span className="badge badge-success">On Time</span>;
    case "Late Entry":
      return <span className="badge badge-warning">Late</span>;
    case "Half Day":
      return <span className="badge badge-error">Half Day</span>;
    default:
      return <span className="badge badge-primary">{remark}</span>;
  }
}

/* ---------- TIME ---------- */
function formatTime(time: string | null) {
  if (!time) return "—";
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/* ---------- PAGE ---------- */
export default function DashboardPage() {
  const router = useRouter();

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [lateToday, setLateToday] = useState(0);
  const [halfDayToday, setHalfDayToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance[]>([]);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const user = await getCurrentUser();
    if (!user) return router.replace("/login");
    const role = await getUserRole(user.id);
    if (role !== "admin") return router.replace("/employee/attendance");
    await loadStats();
    setLoading(false);
  }

  async function loadStats() {
    const today = new Date().toISOString().split("T")[0];

    /* EMPLOYEES */
    const { data: employees, count: empCount } = await supabase
      .from("employees")
      .select("employee_id, name, department", { count: "exact" });

    /* TODAY ATTENDANCE */
    const { data: attendance } = await supabase
      .from("attendance")
      .select("id, employee_id, punch_in, remark")
      .eq("date", today)
      .order("punch_in", { ascending: false });

    const presentSet = new Set(
      (attendance || []).map((a) => a.employee_id)
    );

    /* COUNTS */
    const lateCount = attendance?.filter(
      (a) => a.remark === "Late Entry"
    ).length || 0;

    const halfDayCount = attendance?.filter(
      (a) => a.remark === "Half Day"
    ).length || 0;

    /* DEPARTMENT STATS */
    const deptMap = new Map<string, { present: number; absent: number }>();

    (employees || []).forEach((emp) => {
      const dept = emp.department || "Unknown";
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { present: 0, absent: 0 });
      }

      if (presentSet.has(emp.employee_id)) {
        deptMap.get(dept)!.present++;
      } else {
        deptMap.get(dept)!.absent++;
      }
    });

    setDeptStats(
      Array.from(deptMap.entries()).map(([department, v]) => ({
        department,
        present: v.present,
        absent: v.absent,
      }))
    );

    const nameMap = new Map(
      (employees || []).map((e) => [e.employee_id, e.name])
    );

    setTodayAttendance(
      attendance?.map((a) => ({
        ...a,
        employee_name: nameMap.get(a.employee_id) ?? "—",
      })) || []
    );

    setTotalEmployees(empCount || 0);
    setPresentToday(attendance?.length || 0);
    setLateToday(lateCount);
    setHalfDayToday(halfDayCount);
    setAbsentToday((empCount || 0) - (attendance?.length || 0));
  }

  /* ---------- CHART DATA ---------- */
  const chartData = {
    labels: deptStats.map((d) => d.department),
    datasets: [
      {
        label: "Present",
        data: deptStats.map((d) => d.present),
        backgroundColor: "#22c55e",
      },
      {
        label: "Absent",
        data: deptStats.map((d) => d.absent),
        backgroundColor: "#ef4444",
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-800 font-medium">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <div className="pb-28">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] p-8 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-3xl font-bold tracking-tight relative z-10">Admin Dashboard</h1>
            <p className="text-[var(--primary-light)] text-sm mt-1.5 font-medium relative z-10">
              Today’s attendance overview and department metrics
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <StatCard title="Total Employees" value={String(totalEmployees)} color="text-[var(--primary)]" />
            <StatCard title="Present Today" value={String(presentToday)} color="text-[var(--success)]" />
            <StatCard title="Late Entries" value={String(lateToday)} color="text-[var(--warning)]" />
            <StatCard title="Half Day" value={String(halfDayToday)} color="text-[var(--error)]" />
            <StatCard title="Absent Today" value={String(absentToday)} color="text-slate-500" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* DEPARTMENT CHART */}
            <div className="card p-6 xl:col-span-1">
              <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">
                Department Activity
              </h2>

              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </div>

            {/* TABLE */}
            <div className="card p-6 xl:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  Today’s Attendance
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">EMP ID</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {todayAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No attendance records for today.
                        </td>
                      </tr>
                    ) : (
                      todayAttendance.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors last:border-0">
                          <td className="p-4 font-semibold text-slate-700">{row.employee_id}</td>
                          <td className="p-4 font-medium text-slate-900">{row.employee_name}</td>
                          <td className="p-4 text-slate-600 font-medium">{formatTime(row.punch_in)}</td>
                          <td className="p-4">
                            <span className="badge badge-success">
                              Present
                            </span>
                          </td>
                          <td className="p-4">
                            <StatusBadge remark={row.remark} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}
