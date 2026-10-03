"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const tab = searchParams.get("tab");
      const queryString = tab ? `?tab=${tab}` : "";

      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.role === "STUDENT") {
        router.replace(`/student${queryString}`);
      } else {
        router.replace(`/instructor${queryString}`);
      }
    }
  }, [user, isLoading, router, searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Routing to your dedicated dashboard...</p>
    </div>
  );
}

export default function DashboardRouter() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Routing to your dedicated dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

