"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import FaceCapture from "@/app/components/FaceCapture";

type EmployeeFormProps = {
  onEmployeeAdded: () => void;
};

export default function EmployeeForm({ onEmployeeAdded }: EmployeeFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [dbId, setDbId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch("/api/employees", {
        method: "POST",
        body: JSON.stringify({ employee_id: employeeId, name, department }),
      });

      alert("Employee added ✅ Now capture face");
      setDbId(data.id);
    } catch (err) {
      alert("Error adding employee: " + (err instanceof Error ? err.message : "Unknown error"));
    }

    setLoading(false);
  }

  async function handleFaceCapture(descriptor: number[]) {
    if (!dbId) return;

    try {
      await apiFetch(`/api/employees/${dbId}/face`, {
        method: "POST",
        body: JSON.stringify({ descriptor }),
      });

      alert("✅ Face registered successfully");

      // reset everything
      setEmployeeId("");
      setName("");
      setDepartment("");
      setDbId(null);

      onEmployeeAdded();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Face registration failed");
    }
  }

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-xl font-semibold">Add Employee</h2>

      {!dbId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="border p-2 w-full"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />

          <input
            className="border p-2 w-full"
            placeholder="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="border p-2 w-full"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Add Employee"}
          </button>
        </form>
      )}

      {dbId && (
        <>
          <p className="text-sm text-gray-600">
            Capture face for this employee
          </p>
          <FaceCapture onCapture={handleFaceCapture} />
        </>
      )}
    </div>
  );
}
