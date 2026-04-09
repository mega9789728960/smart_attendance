"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Employee = {
  employee_id: string;
  name: string;
};

export default function AbsentDetection() {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [absentEmployees, setAbsentEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    findAbsentEmployees();
  }, [date]);

  async function findAbsentEmployees() {
    setLoading(true);

    try {
      const data = await apiFetch(`/api/attendance/absent?date=${date}`);
      setAbsentEmployees(data || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load");
    }

    setLoading(false);
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">
        Absent Employees
      </h2>

      <div className="mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {loading ? (
        <p>Checking absentees...</p>
      ) : absentEmployees.length === 0 ? (
        <p>🎉 No absentees for this date.</p>
      ) : (
        <div className="space-y-2">
          {absentEmployees.map((emp) => (
            <div
              key={emp.employee_id}
              className="border p-3 rounded"
            >
              <p className="font-medium">{emp.name}</p>
              <p className="text-sm text-gray-600">
                Employee ID: {emp.employee_id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
