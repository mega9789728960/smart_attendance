"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken, getStoredUser } from "@/lib/api";
import * as faceapi from "face-api.js";
import LivenessFaceCapture from "@/app/components/LivenessFaceCapture";
import FaceRegister from "@/app/components/FaceRegister";
import MobileBottomNav from "@/app/components/MobileBottomNav";

/* ---------- CONFIG ---------- */
// ✅ ATTENDANCE RULES
const OFFICE_START_TIME = "09:30";
const LATE_AFTER_TIME = "09:45";
const HALF_DAY_AFTER_TIME = "13:00";

/* ---------- HELPERS ---------- */
function getAttendanceStatus(punchInTime: Date) {
  const timeStr = punchInTime.toTimeString().slice(0, 5);

  if (timeStr <= OFFICE_START_TIME) {
    return { status: "present", remark: "On Time" };
  }

  if (timeStr <= LATE_AFTER_TIME) {
    return { status: "present", remark: "Late Entry" };
  }

  if (timeStr <= HALF_DAY_AFTER_TIME) {
    return { status: "present", remark: "Half Day" };
  }

  return { status: "present", remark: "Late" };
}

function faceDistance(a: number[], b: number[]) {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
  );
}

/* ---------- TYPES ---------- */
type PunchAction = "punch_in" | "punch_out";

/* ---------- COMPONENT ---------- */
export default function Attendance() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [storedFace, setStoredFace] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFace, setShowFace] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [punchAction, setPunchAction] = useState<PunchAction | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [needsFaceRegistration, setNeedsFaceRegistration] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);

  // Track today's attendance state
  const [hasPunchedIn, setHasPunchedIn] = useState(false);
  const [hasPunchedOut, setHasPunchedOut] = useState(false);
  const [todayRecord, setTodayRecord] = useState<{
    id: string;
    punch_in: string | null;
    punch_out: string | null;
    remark: string | null;
  } | null>(null);

  /* ✅ Load logged-in employee + today's attendance on mount */
  useEffect(() => {
    init();
    loadFaceModels();
  }, []);

  async function loadFaceModels() {
    try {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    } catch (err) {
      console.error("Failed to load generic face models", err);
    }
  }

  async function init() {
    setLoading(true);

    const token = getToken();
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      setStatus("❌ Not logged in. Please login first.");
      setLoading(false);
      return;
    }

    if (storedUser.role === "admin") {
      window.location.replace("/dashboard");
      return;
    }

    try {
      // Get full employee data from backend
      const employee = await apiFetch("/api/auth/me");

      setEmployeeId(employee.employee_id);
      setStoredFace(employee.face_descriptor);
      setEmployeeData(employee);
      setIsApproved(employee.approved);

      if (
        !Array.isArray(employee.face_descriptor) ||
        employee.face_descriptor.length === 0
      ) {
        setNeedsFaceRegistration(true);
        setStatus("⚠️ Your face is not registered. Please register it now.");
        setLoading(false);
        return;
      }

      if (!employee.approved) {
        setStatus("⌛ Your profile has not been approved by an Admin yet. Please wait.");
        setLoading(false);
        return;
      }

      // Check today's attendance record
      const existing = await apiFetch("/api/attendance/my-today");

      if (existing) {
        setTodayRecord(existing);
        setHasPunchedIn(!!existing.punch_in);
        setHasPunchedOut(!!existing.punch_out);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load employee data.");
    }

    setLoading(false);
  }

  /* ---------- Start Punch (In or Out) ---------- */
  async function startPunch(action: PunchAction) {
    if (!employeeId || !storedFace) return;

    setPunchAction(action);

    if (!navigator.geolocation) {
      setStatus("❌ GPS not supported on this device");
      return;
    }

    setLoading(true);
    setStatus("📍 Verifying campus location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          await apiFetch('/api/attendance/verify-location', {
            method: 'POST',
            body: JSON.stringify({ latitude, longitude })
          });
        } catch (err: any) {
          setStatus(`❌ ${err.message || "Location verification failed"}`);
          setLoading(false);
          setPunchAction(null);
          return;
        }

        setStatus("✅ Location verified. Please verify your face");
        setShowFace(true);
        setLoading(false);
      },
      (err) => {
        setStatus(`❌ Location error: ${err.message}`);
        setLoading(false);
        setPunchAction(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  /* ---------- Face Verified → Execute Punch ---------- */
  async function handleFaceVerified(imageSrc: string) {
    if (!storedFace || !employeeId || !punchAction) return;

    setLoading(true);
    setStatus("🔍 Verifying face with backend...");

    if (!modelsLoaded) {
      setStatus("❌ Face matching models not loaded yet.");
      setLoading(false);
      setShowFace(false);
      setPunchAction(null);
      return;
    }

    // 1. Create an image element from the base64 output of MediaPipe
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // 2. Extract descriptor using face-api.js
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ Could not extract face features for matching. Try again.");
      setLoading(false);
      setShowFace(false);
      setPunchAction(null);
      return;
    }

    const liveDescriptor = Array.from(detection.descriptor);

    // 3. Compare with stored descriptor from the database
    const distance = faceDistance(liveDescriptor, storedFace);
    console.log(`Face match distance: ${distance}`);

    if (distance > 0.6) {
      setStatus("❌ Face mismatch. Attendance denied.");
      setLoading(false);
      setShowFace(false);
      setPunchAction(null);
      return;
    }

    try {
      if (punchAction === "punch_in") {
        const attendanceResult = getAttendanceStatus(new Date());

        const result = await apiFetch("/api/attendance/punch-in", {
          method: "POST",
          body: JSON.stringify({
            status: attendanceResult.status,
            remark: attendanceResult.remark,
          }),
        });

        setStatus(`✅ Punched In (${attendanceResult.remark})`);
        setHasPunchedIn(true);
      } else {
        await apiFetch("/api/attendance/punch-out", {
          method: "POST",
        });

        setStatus("✅ Punched Out successfully");
        setHasPunchedOut(true);
      }
    } catch (err) {
      setStatus(`❌ ${err instanceof Error ? err.message : "Punch failed"}`);
    }

    setShowFace(false);
    setLoading(false);
    setPunchAction(null);

    // Refresh today's record
    await refreshTodayRecord();
  }

  async function refreshTodayRecord() {
    try {
      const data = await apiFetch("/api/attendance/my-today");

      if (data) {
        setTodayRecord(data);
        setHasPunchedIn(!!data.punch_in);
        setHasPunchedOut(!!data.punch_out);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------- Format time for display ---------- */
  function formatTime(isoString: string | null) {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  /* ---------- UI ---------- */
  const isPunchInDisabled = hasPunchedIn || loading;
  const isPunchOutDisabled = !hasPunchedIn || hasPunchedOut || loading;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-20">
      <div className="w-full max-w-md card space-y-6">
        <h2 className="text-3xl font-bold text-center text-[var(--primary)] tracking-tight">
          Attendance
        </h2>

        {/* ── Status Message ── */}
        {status && (
          <div className={`text-center text-sm p-3 rounded-lg font-medium shadow-sm ${!isApproved && !needsFaceRegistration ? 'bg-orange-100 text-orange-700' : 'bg-[var(--primary-light)] text-[var(--primary)]'}`}>
            {status}
          </div>
        )}

        {/* ── Today's Summary ── */}
        {todayRecord && (
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Today&apos;s Record
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Punch In</span>
              <span className="badge badge-success">
                {formatTime(todayRecord.punch_in)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Punch Out</span>
              <span className="badge badge-error">
                {formatTime(todayRecord.punch_out)}
              </span>
            </div>
            {todayRecord.remark && (
              <div className="flex justify-between items-center text-sm pt-3 mt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Remark</span>
                <span className="badge badge-primary">
                  {todayRecord.remark}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Punch In / Punch Out Buttons ── */}
        {!showFace && !loading && !needsFaceRegistration && isApproved && (
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => startPunch("punch_in")}
              disabled={isPunchInDisabled}
              className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all shadow-sm ${isPunchInDisabled
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-[var(--success)] text-white hover:bg-emerald-600 active:scale-95 hover:shadow-md"
                }`}
            >
              Punch In
            </button>

            <button
              onClick={() => startPunch("punch_out")}
              disabled={isPunchOutDisabled}
              className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all shadow-sm ${isPunchOutDisabled
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-[var(--error)] text-white hover:bg-red-600 active:scale-95 hover:shadow-md"
                }`}
            >
              Punch Out
            </button>
          </div>
        )}

        {/* ── Waiting for approval or Face Registration Buttons ── */}
        {!loading && needsFaceRegistration && (
          <div className="pt-2 text-center">
            <button 
              onClick={() => setShowFace(true)}
              className="w-full py-3 rounded-xl text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            >
              Open Camera to Register Face
            </button>
          </div>
        )}

        {/* ── Loading Spinner ── */}
        {loading && !showFace && (
          <div className="text-center py-6">
            <div className="inline-block w-8 h-8 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin" />
          </div>
        )}

        {/* ── Face Verification / Registration ── */}
        {showFace && needsFaceRegistration && employeeData && (
          <FaceRegister
            employee={employeeData}
            onSuccess={async (descriptor) => {
              setShowFace(false);
              setNeedsFaceRegistration(false);
              setStoredFace(descriptor);
              setStatus("⌛ Face registered successfully. Waiting for Admin approval.");
            }}
            onClose={() => setShowFace(false)}
          />
        )}
        
        {showFace && !needsFaceRegistration && isApproved && (
          <LivenessFaceCapture
            onCapture={handleFaceVerified}
            onCancel={() => {
              setShowFace(false);
              setPunchAction(null);
              setStatus(null);
            }}
            timeoutSeconds={10}
          />
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
