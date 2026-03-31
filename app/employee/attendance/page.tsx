"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/app/components/MobileBottomNav";

type Attendance = {
  id: string;
  date: string;
  status: string | null;
  punch_in?: string | null;
  remark?: string | null;
};

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [faceRegistered, setFaceRegistered] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);


    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("employee_id, face_descriptor, role")
      .eq("auth_user_id", user.id)
      .single();

    if (empError || !employee) {
      router.replace("/login");
      return;
    }

    if (employee.role === "admin") {
      router.replace("/dashboard");
      return;
    }

    setFaceRegistered(
      Array.isArray(employee.face_descriptor) &&
        employee.face_descriptor.length > 0
    );

    const { data } = await supabase
      .from("attendance")
      .select("id, date, status, punch_in, remark")
      .eq("employee_id", employee.employee_id)
      .order("date", { ascending: false });

    setRecords(data || []);
    setLoading(false);
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              My Attendance
            </h1>
            <p className="text-gray-700 mt-1">
              View your daily attendance history
            </p>
          </div>

          {/* FACE WARNING */}
          {!faceRegistered && !loading && (
            <div className="mb-5 rounded-xl bg-yellow-100 border border-yellow-400 p-4 text-yellow-900 text-sm font-medium">
              ⚠️ Face not registered.
              <br />
              Please contact admin to complete face registration.
            </div>
          )}

          {/* CONTENT CARD */}
          <div className="bg-white rounded-xl shadow-md p-4">
            {loading && (
              <p className="text-center text-gray-800 py-6 font-medium">
                Loading attendance…
              </p>
            )}

            {!loading && records.length === 0 && (
              <p className="text-center text-gray-800 py-6 font-medium">
                No attendance records found
              </p>
            )}

            {!loading && records.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-blue-100 text-blue-900 text-sm font-semibold">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Punch In</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-900">
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">
                          {r.date}
                        </td>
                        <td className="p-3">
                          {r.punch_in
                            ? new Date(r.punch_in).toLocaleTimeString()
                            : "—"}
                        </td>
                        <td className="p-3 font-semibold capitalize">
                          {r.status ?? "—"}
                        </td>
                        <td className="p-3">
                          {r.remark ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}
