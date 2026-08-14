"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { handleUnauthorized } from "@/lib/api";
import { getDashboardSummary } from "@/services/dashboardService";
import DoctorsOverTimeChart from "./DoctorsOverTimeChart";
import PatientsByConditionChart from "./PatientsByConditionChart";
import PatientsOverTimeChart from "./PatientsOverTimeChart";
import PatientsPerDoctorChart from "./PatientsPerDoctorChart";
import StatCard, { StatCardSkeleton } from "./StatCard";

function DoctorsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 20.5c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PatientsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 20c.5-3 2.8-5 5.5-5s5 2 5.5 5M15 15.5c2.2 0 4.1 1.4 4.7 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MonthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 4v3M17 4v3M5 9.5h14M6.5 7h11A1.5 1.5 0 0 1 19 8.5v10A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-10A1.5 1.5 0 0 1 6.5 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AverageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 19 19 5M8 5h4v4M16 15h4v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M20 12a8 8 0 1 1-2.3-5.6M20 5v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartSkeleton() {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 h-64 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await getDashboardSummary();

        if (cancelled) {
          return;
        }

        setData(response.data);
        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (handleUnauthorized(err, router)) {
          return;
        }

        setData(null);
        setError("Unable to load dashboard data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadToken, router]);

  function handleRefresh() {
    setLoading(true);
    setError("");
    setReloadToken((value) => value + 1);
  }

  const summary = data?.summary;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Doctor Tracker</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dashboard overview and patient insights.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          loading={loading}
          onClick={handleRefresh}
        >
          <RefreshIcon />
          Refresh
        </Button>
      </div>

      {error ? (
        <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">{error}</p>
          <p className="mt-1 text-sm text-slate-500">
            Check your connection and try again.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </section>
      ) : null}

      {!error && loading ? (
        <>
          <section
            aria-label="Loading statistics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </section>

          <section
            aria-label="Loading charts"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </section>
        </>
      ) : null}

      {!error && !loading && summary ? (
        <>
          <section
            aria-label="Dashboard statistics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              label="Total Doctors"
              value={summary.totalDoctors}
              icon={<DoctorsIcon />}
            />
            <StatCard
              label="Total Patients"
              value={summary.totalPatients}
              icon={<PatientsIcon />}
            />
            <StatCard
              label="Patients This Month"
              value={summary.patientsThisMonth}
              icon={<MonthIcon />}
            />
            <StatCard
              label="Average Patients / Doctor"
              value={summary.averagePatientsPerDoctor}
              icon={<AverageIcon />}
            />
          </section>

          <section
            aria-label="Dashboard charts"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <PatientsPerDoctorChart data={data.patientsPerDoctor} />
            <PatientsByConditionChart data={data.patientsByCondition} />
            <PatientsOverTimeChart data={data.patientsOverTime} />
            <DoctorsOverTimeChart data={data.doctorsOverTime} />
          </section>
        </>
      ) : null}
    </div>
  );
}
