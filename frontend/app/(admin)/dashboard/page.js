export const metadata = {
  title: "Dashboard | Doctor Tracker",
};

const placeholderStats = [
  { key: "totalDoctors", label: "Total Doctors", value: "24" },
  { key: "totalPatients", label: "Total Patients", value: "156" },
  { key: "activeDoctors", label: "Active Doctors", value: "18" },
  { key: "recentPatients", label: "Recent Patients", value: "8" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Placeholder values — live analytics will be added later.
        </p>
      </div>

      <section
        aria-label="Placeholder statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {placeholderStats.map((stat) => (
          <article
            key={stat.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          Analytics will appear here
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Charts and reports are not available yet.
        </p>
      </section>
    </div>
  );
}
