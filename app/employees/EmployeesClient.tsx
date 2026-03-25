"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FaceRegister from "@/app/components/FaceRegister";
import InlineEditEmployeeModal from "@/app/components/InlineEditEmployeeModal";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  face_descriptor: number[] | null;
};

const PAGE_SIZE = 6;

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] =
    useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, [page]);

  async function loadEmployees() {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("employees")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    setEmployees(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function deleteEmployee(id: string) {
    if (!confirm("Delete this employee?")) return;
    await supabase.from("employees").delete().eq("id", id);
    loadEmployees();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function goToPage(p: number) {
    router.push(`?page=${p}`);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Employees</h2>
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Total: {total}
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading employees…</p>}

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-4 md:hidden">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl shadow border p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">Employee ID</p>
                <p className="font-semibold">{emp.employee_id}</p>
              </div>

              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  emp.face_descriptor
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {emp.face_descriptor ? "Face ✓" : "Face ✕"}
              </span>
            </div>

            <div>
              <p className="text-lg font-bold text-blue-700">
                {emp.name}
              </p>
              <p className="text-sm text-gray-600">
                {emp.department}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEmployee(emp)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
              >
                Register Face
              </button>

              <button
                onClick={() => setEditEmployee(emp)}
                className="px-3 bg-indigo-100 text-indigo-700 rounded-lg"
              >
                ✏️
              </button>

              <button
                onClick={() => deleteEmployee(emp.id)}
                className="px-3 bg-red-100 text-red-700 rounded-lg"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Department</th>
              <th className="p-4">Face</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="p-4">{emp.employee_id}</td>
                <td className="p-4 font-medium">{emp.name}</td>
                <td className="p-4">{emp.department}</td>
                <td className="p-4">
                  {emp.face_descriptor ? (
                    <span className="text-green-600 font-semibold">
                      Yes
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      No
                    </span>
                  )}
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Face
                  </button>
                  <button
                    onClick={() => setEditEmployee(emp)}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "border"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* MODALS */}
      {selectedEmployee && (
        <FaceRegister
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSuccess={async () => {
            setSelectedEmployee(null);
            loadEmployees();
          }}
        />
      )}

      {editEmployee && (
        <InlineEditEmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onUpdated={async () => {
            setEditEmployee(null);
            loadEmployees();
          }}
        />
      )}
    </div>
  );
}
