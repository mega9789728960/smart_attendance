"use client";

import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
};

type FaceRegisterProps = {
  employee: Employee;
  onSuccess: (descriptor: number[]) => Promise<void>;
  onClose: () => void;
};

export default function FaceRegister({
  employee,
  onSuccess,
  onClose,
}: FaceRegisterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [instruction, setInstruction] = useState(
    "Position your face clearly inside the camera frame."
  );
  const [error, setError] = useState<string | null>(null);

  /* ---------- LOAD MODELS + CAMERA ---------- */
  useEffect(() => {
    let stream: MediaStream;

    async function init() {
      try {
        setInstruction("⏳ Loading face detection models...");

        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsReady(true);
        setInstruction("📷 Allow camera access and look straight.");

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
        setError("Camera or model loading failed.");
        setInstruction("❌ Unable to access camera.");
      }
    }

    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ---------- REGISTER FACE ---------- */
  async function registerFace() {
    if (!videoRef.current || loading || !modelsReady) return;

    setLoading(true);
    setError(null);
    setInstruction("📸 Capturing face… Please stay still.");

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setInstruction("❌ No face detected. Try again.");
      setLoading(false);
      return;
    }

    const descriptor = Array.from(detection.descriptor);

    setInstruction("💾 Saving face data securely…");

    try {
      await apiFetch(`/api/employees/face-by-empid/${employee.employee_id}`, {
        method: "POST",
        body: JSON.stringify({ descriptor }),
      });

      setInstruction("✅ Face registered successfully!");
      await onSuccess(descriptor);
      setTimeout(onClose, 900);
    } catch (err) {
      console.error("Face save error:", err);
      setError(`Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`);
      setInstruction("❌ Face registration failed.");
    }

    setLoading(false);
  }

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Register Face Data
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Employee: <span className="font-bold text-[var(--primary)]">{employee.name}</span>
          </p>
        </div>

        {/* Instruction */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          {instruction}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Camera */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg border border-gray-300"
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={registerFace}
            disabled={loading || !modelsReady}
            className={`flex-1 btn btn-primary py-3 rounded-xl font-semibold shadow-sm ${
              loading || !modelsReady
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? "Processing…" : "Capture Face"}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Saving face data…
          </div>
        )}
      </div>
    </div>
  );
}
