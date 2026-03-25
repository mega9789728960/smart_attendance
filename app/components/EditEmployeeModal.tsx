"use client";

import { useState } from "react";

type Props = {
  employee: {
    id: string;
    employee_id: string;
    name: string;
    department: string;
  };
  onSave: (data: { name: string; department: string }) => void;
  onClose: () => void;
};

export default function EditEmployeeModal({
  employee,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(employee.name);
  const [department, setDepartment] = useState(employee.department);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Edit Employee
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Employee ID</label>
            <input
              disabled
              value={employee.employee_id}
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave({ name, department })}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
