"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken, getStoredUser } from "@/lib/api";
import FaceCapture from "@/app/components/FaceCapture";

/* ---------- CONFIG ---------- */

/* ---------- HELPERS ---------- */
function faceDistance(a: number[], b: number[]) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/* ---------- COMPONENT ---------- */
type AttendanceProps = {
  disabled?: boolean;
};

export default function Attendance({ disabled = false }: AttendanceProps) {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [storedFace, setStoredFace] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFace, setShowFace] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  /* ✅ Load logged‑in employee once */
  useEffect(() => {
    init();
  }, []);

  async function init() {
    const token = getToken();
    if (!token) {
      setStatus("❌ Not logged in");
      return;
    }

    try {
      const employee = await apiFetch("/api/auth/me");

      setEmployeeId(employee.employee_id);
      setStoredFace(employee.face_descriptor);

      if (
        !Array.isArray(employee.face_descriptor) ||
        employee.face_descriptor.length === 0
      ) {
        setStatus(
          "⚠️ Face not registered. Please contact admin before punching attendance."
        );
      }
    } catch (err) {
      setStatus("❌ Employee record not found");
    }
  }

  /* ---------- Punch In ---------- */
  async function startPunchIn() {
    if (disabled) {
      setStatus("⚠️ Face not registered. Contact admin.");
      return;
    }
    if (!employeeId) return;

    if (!storedFace) {
      setStatus("⚠️ Face not registered. Attendance blocked.");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("❌ GPS not supported");
      return;
    }

    setLoading(true);
    setStatus("📍 Checking location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await apiFetch('/api/attendance/verify-location', {
            method: 'POST',
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            })
          });
        } catch (err: any) {
          setStatus(`❌ ${err.message || 'Outside campus'}`);
          setLoading(false);
          return;
        }

        setShowFace(true);
        setStatus("✅ Location verified. Verify face");
        setLoading(false);
      },
      () => {
        setStatus("❌ Location permission denied");
        setLoading(false);
      }
    );
  }

  /* ---------- Face Verify ---------- */
  async function handleFaceVerified(live: number[]) {
    if (!storedFace || !employeeId) return;

    setLoading(true);
    setStatus("🔍 Verifying face...");

    if (faceDistance(live, storedFace) > 0.6) {
      setStatus("❌ Face mismatch");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/api/attendance/punch-in", {
        method: "POST",
        body: JSON.stringify({ status: "Present", remark: "On Time" }),
      });
      setStatus("✅ Attendance marked successfully");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "❌ Failed to mark attendance");
    }

    setShowFace(false);
    setLoading(false);
  }

  /* ---------- UI ---------- */
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Attendance Punch</h2>

      {status && (
        <div className="text-center text-sm bg-gray-100 p-3 rounded">
          {status}
        </div>
      )}

      {!showFace && (
        <button
          onClick={startPunchIn}
          disabled={loading || disabled}
          className={`w-full py-3 text-lg rounded-lg text-white ${
            disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
          }`}
        >
          {loading ? "Checking..." : "Punch In"}
        </button>
      )}

      {showFace && <FaceCapture onCapture={handleFaceVerified} />}
    </div>
  );
}
