"use client";

import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function clientAction(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    const result = await login(formData);
    if (result?.error) {
      setErrorMsg(result.error);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-400 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-gray-800">
            Smart Attendance
          </h1>
          <p className="text-sm text-gray-500">
            Admin / Employee Login
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form action={clientAction}>
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
