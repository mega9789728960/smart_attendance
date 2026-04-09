"use client";

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          Smart Attendance System
        </h1>

        <div className="flex items-center gap-4">
          {/* UI-only placeholder */}
          <span className="text-sm text-gray-600">
            Logged in
          </span>
        </div>
      </div>
    </header>
  );
}
