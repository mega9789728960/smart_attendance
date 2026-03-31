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
    <div className="bg-white rounded-xl shadow border p-5">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/* ---------- BADGE (REMARK BASED) ---------- */
function StatusBadge({ remark }: { remark: string | null }) {
  if (!remark)
    return (
      <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800">
        —
      </span>
    );

  const base = "px-2 py-1 rounded text-xs font-semibold";

  switch (remark) {
    case "On Time":
      return <span className={`${base} bg-green-100 text-green-800`}>On Time</span>;
    case "Late Entry":
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Late</span>;
    case "Half Day":
      return <span className={`${base} bg-orange-100 text-orange-800`}>Half Day</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-800`}>{remark}</span>;
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
      <div className="min-h-screen bg-gray-50 px-4 py-6 pb-28">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-6 shadow">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-blue-100 text-sm mt-1">
              Today’s attendance overview
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Employees" value={String(totalEmployees)} color="text-gray-900" />
            <StatCard title="Present Today" value={String(presentToday)} color="text-green-600" />
            <StatCard title="Late Entries" value={String(lateToday)} color="text-yellow-600" />
            <StatCard title="Half Day" value={String(halfDayToday)} color="text-orange-600" />
            <StatCard title="Absent Today" value={String(absentToday)} color="text-red-600" />
          </div>

          {/* DEPARTMENT CHART */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Department‑wise Present vs Absent
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
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Today’s Attendance
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-100 text-blue-900 text-sm font-semibold">
                  <tr>
                    <th className="p-3 text-left">EMP ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-900">
                  {todayAttendance.map((row) => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{row.employee_id}</td>
                      <td className="p-3 font-medium">{row.employee_name}</td>
                      <td className="p-3">{formatTime(row.punch_in)}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                          Present
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusBadge remark={row.remark} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}
