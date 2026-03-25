"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Attendance = {
  id: string;
  date: string;
  status: string | null;
};

export default function EmployeeAttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    setLoading(true);

    // 1️⃣ Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      console.error("Auth error:", userError);
      setLoading(false);
      return;
    }

    console.log("User email:", user.email);

    // 2️⃣ Get employee_id using email
    const {
      data: employee,
      error: empError,
    } = await supabase
      .from("employees")
      .select("employee_id")
      .eq("email", user.email)
      .single(); // ✅ IMPORTANT

    if (empError) {
      console.error("Employee fetch error:", empError);
      setLoading(false);
      return;
    }

    console.log("Employee ID:", employee.employee_id);

    // 3️⃣ Fetch attendance
    const {
      data: attendance,
      error: attError,
    } = await supabase
      .from("attendance")
      .select("id, date, status")
      .eq("employee_id", employee.employee_id)
      .order("date", { ascending: false });

    if (attError) {
      console.error("Attendance error:", attError);
      setLoading(false);
      return;
    }

    console.log("Attendance rows:", attendance);

    setRecords(attendance || []);
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Attendance History
      </h2>

      {loading && <p>Loading...</p>}

      {!loading && records.length === 0 && (
        <p className="text-gray-500">
          No attendance records found
        </p>
      )}

      {!loading && records.length > 0 && (
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.status ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
