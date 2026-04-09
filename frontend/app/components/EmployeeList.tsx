"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type EmployeeListProps = {
  refreshKey: number;
};

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  face_registered: boolean;
  approved: boolean;
};

export default function EmployeeList({ refreshKey }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);

    try {
      const result = await apiFetch("/api/employees?limit=10000");
      setEmployees(result.data || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
      alert("Employee deleted ✅");
      fetchEmployees();
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const toggleApproval = async (emp: Employee) => {
    if (!emp.face_registered && !emp.approved) {
      alert("Employee has not registered their face yet.");
      return;
    }
    
    try {
      await apiFetch(`/api/employees/${emp.id}/approve`, { 
        method: "PUT",
        body: JSON.stringify({ approved: !emp.approved }) 
      });
      fetchEmployees();
    } catch (err) {
      alert("Approval toggle failed: " + (err instanceof Error ? err.message : "Unknown error"));
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
    try {
      await apiFetch(`/api/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName, department: editDepartment }),
      });
      alert("Employee updated ✅");
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      alert("Update failed: " + (err instanceof Error ? err.message : "Unknown error"));
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
                  <div className="flex gap-2 mt-2">
                    {!emp.face_registered ? (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Pending Face</span>
                    ) : emp.approved ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Approved</span>
                    ) : (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Pending Approval</span>
                    )}
                  </div>
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
                    {!emp.face_registered ? null : (
                      <button
                        onClick={() => toggleApproval(emp)}
                        className={`${emp.approved ? 'bg-orange-500' : 'bg-green-600'} text-white px-3 py-1 rounded`}
                      >
                        {emp.approved ? "Revoke" : "Approve"}
                      </button>
                    )}
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
