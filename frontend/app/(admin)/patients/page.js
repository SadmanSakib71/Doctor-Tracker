import { Suspense } from "react";
import PatientsPage, { PatientsPageFallback } from "@/components/patients/PatientsPage";

export const metadata = {
  title: "Patients | Doctor Tracker",
};

export default function Page() {
  return (
    <Suspense fallback={<PatientsPageFallback />}>
      <PatientsPage />
    </Suspense>
  );
}
