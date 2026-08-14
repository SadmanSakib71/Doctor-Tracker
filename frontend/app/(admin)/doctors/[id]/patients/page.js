import { Suspense } from "react";
import {
  DoctorPatientsPage,
  PatientsPageFallback,
} from "@/components/patients/PatientsPage";

export const metadata = {
  title: "Doctor Patients | Doctor Tracker",
};

export default function Page() {
  return (
    <Suspense fallback={<PatientsPageFallback />}>
      <DoctorPatientsPage />
    </Suspense>
  );
}
