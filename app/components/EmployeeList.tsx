"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EmployeeListProps = {
  refreshKey: number;
};

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
};

export default function EmployeeList({ refreshKey }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("id", { ascending: true });

    if (!error) {
      setEmployees(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Employee deleted ✅");
      fetchEmployees();
    }
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditName(emp.name);
    setEditDepartment(emp.department);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDepartment("");
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("employees")
      .update({
        name: editName,
        department: editDepartment,
      })
      .eq("id", id);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      alert("Employee updated ✅");
      setEditingId(null);
      fetchEmployees();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Employee List</h2>

      {loading ? (
        <p>Loading...</p>
      ) : employees.length === 0 ? (
        <div className="border p-4 rounded">
          <p>No employees yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              {editingId === emp.id ? (
                <div className="flex-1 space-y-2 mr-4">
                  <input
                    className="border p-2 w-full"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-gray-600">
                    {emp.employee_id} — {emp.department}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {editingId === emp.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(emp.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(emp)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
