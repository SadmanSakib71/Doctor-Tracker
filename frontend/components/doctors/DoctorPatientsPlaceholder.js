"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { handleUnauthorized } from "@/lib/api";
import { getDoctor } from "@/services/doctorService";

export default function DoctorPatientsPlaceholder() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.id;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDoctor() {
      if (!doctorId) {
        setError("Doctor not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getDoctor(doctorId);

        if (!cancelled) {
          setDoctor(result.data);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (handleUnauthorized(err, router)) {
          return;
        }

        setError(err.message || "Unable to load doctor details. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDoctor();

    return () => {
      cancelled = true;
    };
  }, [doctorId, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center rounded-md text-sm font-medium text-indigo-700 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          ← Back to Doctors
        </Link>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">
          {loading
            ? "Loading doctor..."
            : doctor
              ? `${doctor.name} — Patients`
              : "Doctor patients"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Patient management will be available in a later phase.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500" role="status">
            Loading doctor details...
          </p>
        ) : null}

        {error ? (
          <div role="alert">
            <p className="text-sm text-red-700">{error}</p>
            <Button type="button" variant="secondary" className="mt-4" onClick={() => router.push("/doctors")}>
              Return to Doctors
            </Button>
          </div>
        ) : null}

        {!loading && !error && doctor ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Patient records for this doctor will appear here.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Patient management will be implemented in Phase 8.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
