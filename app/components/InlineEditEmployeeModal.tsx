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
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] p-5 text-white">
          <h3 className="text-xl font-bold tracking-tight">Edit Employee</h3>
          <p className="text-sm text-white/80 font-medium mt-1">
            {employee.employee_id}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-5">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="btn btn-primary px-6 py-2.5 text-sm"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
