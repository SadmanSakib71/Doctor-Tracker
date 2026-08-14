import { Suspense } from "react";
import DoctorsPage from "@/components/doctors/DoctorsPage";

export const metadata = {
  title: "Doctors | Doctor Tracker",
};

function DoctorsPageFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200" />
      <div className="h-48 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DoctorsPageFallback />}>
      <DoctorsPage />
    </Suspense>
  );
}
