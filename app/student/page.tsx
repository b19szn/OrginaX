"use client";

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import StudentDashboard from "@/components/StudentDashboard";

function StudentContent() {
  const { user } = useAuth();

  const activeUser = user || {
    id: "student-demo",
    name: "Alex Rivera",
    email: "alex.rivera@berkeley.edu",
    role: "STUDENT",
  };

  return <StudentDashboard user={activeUser} />;
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Student Portal...</div>}>
      <StudentContent />
    </Suspense>
  );
}
