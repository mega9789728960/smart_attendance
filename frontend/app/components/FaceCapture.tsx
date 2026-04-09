"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

type Props = {
  onCapture: (descriptor: number[]) => void;
};

export default function FaceCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setLoading(false);
      startCamera();
    }

    loadModels();
  }, []);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }

  async function captureFace() {
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("❌ No face detected. Try again.");
      return;
    }

    onCapture(Array.from(detection.descriptor));
    alert("✅ Face captured successfully");
  }

  if (loading) {
    return <p>Loading face models…</p>;
  }

  return (
    <div className="border p-4 rounded">
      <video
        ref={videoRef}
        autoPlay
        muted
        width={320}
        height={240}
        className="rounded mb-3"
      />
      <button
        onClick={captureFace}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Capture Face
      </button>
    </div>
  );
}
