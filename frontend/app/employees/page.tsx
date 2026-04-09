import { Suspense } from "react";
import EmployeesClient from "./EmployeesClient";

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading employees...</div>}>
      <EmployeesClient />
    </Suspense>
  );
}
