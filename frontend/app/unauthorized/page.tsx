"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Unauthorized Access
      </h1>

      <p className="text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>

      <Link
        href="/login"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
      >
        Go to Login
      </Link>
    </div>
  );
}

