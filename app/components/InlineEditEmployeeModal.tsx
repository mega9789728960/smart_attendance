"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
};

export default function InlineEditEmployeeModal({
  employee,
  onClose,
  onUpdated,
}: {
  employee: Employee;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(employee.name);
  const [department, setDepartment] = useState(employee.department);
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    setSaving(true);

    await supabase
      .from("employees")
      .update({ name, department })
      .eq("id", employee.id);

    setSaving(false);
    onUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <h3 className="text-lg font-semibold">Edit Employee</h3>
          <p className="text-sm opacity-90">
            {employee.employee_id}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
