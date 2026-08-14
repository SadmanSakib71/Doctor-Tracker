"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/shared/Loading";
import { useClientReady } from "@/hooks/useClientReady";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const ready = useClientReady();

  useEffect(() => {
    if (!ready) {
      return;
    }

    router.replace(isAuthenticated() ? "/dashboard" : "/login");
  }, [ready, router]);

  return <Loading message="Loading..." />;
}
