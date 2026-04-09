"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken, getStoredUser } from "@/lib/api";

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

    const token = getToken();
    if (!token) {
      console.error("Not logged in");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/attendance/my-history");
      setRecords(data || []);
    } catch (err) {
      console.error("Attendance error:", err);
    }

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
