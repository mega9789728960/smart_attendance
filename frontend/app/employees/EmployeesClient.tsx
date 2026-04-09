"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import FaceRegister from "@/app/components/FaceRegister";
import InlineEditEmployeeModal from "@/app/components/InlineEditEmployeeModal";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  face_registered: boolean;
  approved: boolean;
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
    try {
      const result = await apiFetch(`/api/employees?page=${page}&limit=${PAGE_SIZE}`);
      setEmployees(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function deleteEmployee(id: string) {
    if (!confirm("Delete this employee?")) return;
    try {
      await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
      loadEmployees();
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  async function toggleApproval(emp: Employee) {
    if (!emp.face_registered && !emp.approved) {
      alert("Employee has not registered their face yet.");
      return;
    }
    try {
      await apiFetch(`/api/employees/${emp.id}/approve`, { 
        method: "PUT",
        body: JSON.stringify({ approved: !emp.approved }) 
      });
      loadEmployees();
    } catch (err) {
      alert("Approval toggle failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function goToPage(p: number) {
    router.push(`?page=${p}`);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] p-8 shadow-lg text-white relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Employees Directory</h1>
          <p className="text-[var(--primary-light)] text-sm mt-1.5 font-medium">Manage personnel and face data</p>
        </div>
        <div className="relative z-10 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/30 flex items-center gap-2 shadow-sm">
          <span className="text-sm font-semibold text-white/90">TOTAL</span>
          <span className="text-2xl font-bold tracking-tight">{total}</span>
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading employees…</p>}

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-4 md:hidden">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="card p-5 space-y-4"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Employee ID</p>
                <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{emp.employee_id}</p>
              </div>

              <div className="flex flex-col gap-1 items-end">
                <span className={`badge ${emp.face_registered ? "badge-success" : "badge-error"}`}>
                  {emp.face_registered ? "Face Registered" : "Face Missing"}
                </span>
                {!emp.face_registered ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">Pending Face</span>
                ) : emp.approved ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">Approved</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">Pending Approval</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-lg font-bold text-slate-800 tracking-tight">
                {emp.name}
              </p>
              <p className="text-sm text-slate-500 font-medium">
                {emp.department}
              </p>
            </div>

            <div className="flex gap-2 pt-2 flex-wrap">
              <button
                onClick={() => setSelectedEmployee(emp)}
                className="flex-1 btn btn-primary py-2 text-sm shadow-sm whitespace-nowrap"
              >
                Face Auth
              </button>

              {emp.face_registered && (
                <button
                  onClick={() => toggleApproval(emp)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-colors whitespace-nowrap ${emp.approved ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  {emp.approved ? "Revoke" : "Approve"}
                </button>
              )}

              <button
                onClick={() => setEditEmployee(emp)}
                className="px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors rounded-xl shadow-sm"
                title="Edit Employee"
              >
                ✎
              </button>

              <button
                onClick={() => deleteEmployee(emp.id)}
                className="px-4 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors rounded-xl shadow-sm"
                title="Delete Employee"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block card p-6">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Employee ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Department</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Face Data</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors last:border-0">
                  <td className="p-4 font-mono font-medium text-slate-600">{emp.employee_id}</td>
                  <td className="p-4 font-semibold text-slate-800 tracking-tight">{emp.name}</td>
                  <td className="p-4 text-slate-600">{emp.department}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      {emp.face_registered ? (
                        <span className="badge badge-success">Registered</span>
                      ) : (
                        <span className="badge badge-error">Missing</span>
                      )}
                      {!emp.face_registered ? (
                        <span className="text-[10px] uppercase font-bold text-gray-500">Pending Face</span>
                      ) : emp.approved ? (
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Approved</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-orange-500">Pending Approval</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                    >
                      Face
                    </button>
                    {emp.face_registered && (
                      <button
                        onClick={() => toggleApproval(emp)}
                        className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors ${
                          emp.approved ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {emp.approved ? "Revoke" : "Approve"}
                      </button>
                    )}
                    <button
                      onClick={() => setEditEmployee(emp)}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Edit 
                    </button>
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            className="px-4 py-2 border border-slate-200 bg-[var(--glass-bg)] rounded-xl font-medium text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors ${
                page === i + 1
                  ? "bg-[var(--primary)] text-white"
                  : "border border-slate-200 bg-[var(--glass-bg)] text-slate-600 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            className="px-4 py-2 border border-slate-200 bg-[var(--glass-bg)] rounded-xl font-medium text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
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
