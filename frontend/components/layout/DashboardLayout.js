"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser, isAuthenticated } from "@/lib/auth";
import { useClientReady } from "@/hooks/useClientReady";
import Loading from "@/components/shared/Loading";
import Header from "./Header";
import Sidebar from "./Sidebar";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/doctors": "Doctors",
  "/patients": "Patients",
};

function getPageTitle(pathname) {
  if (pathname.startsWith("/doctors")) {
    return "Doctors";
  }

  return pageTitles[pathname] || "Doctor Tracker";
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useClientReady();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authenticated = ready && isAuthenticated();

  useEffect(() => {
    if (ready && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [ready, router]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  if (!authenticated) {
    return <Loading message="Checking your session..." />;
  }

  const user = getUser();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        pathname={pathname}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header
          title={title}
          user={user}
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((open) => !open)}
          onLogout={handleLogout}
        />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
