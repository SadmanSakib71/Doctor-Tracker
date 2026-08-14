"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(15 23 42 / 0.06)",
  fontSize: "12px",
};

function truncateLabel(value, max = 12) {
  if (!value) {
    return "";
  }

  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default function PatientsPerDoctorChart({ data }) {
  const rows = Array.isArray(data) ? data : [];
  const isEmpty = rows.length === 0;

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Patients per Doctor</h3>
      <p className="mt-1 text-sm text-slate-500">Top 10 doctors by patient count</p>

      {isEmpty ? (
        <p className="mt-16 mb-10 text-center text-sm text-slate-500">
          No patient data available yet.
        </p>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="doctorName"
                tickFormatter={(value) => truncateLabel(value)}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={56}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "#eef2ff" }}
                contentStyle={tooltipStyle}
                formatter={(value) => [value, "Patients"]}
              />
              <Bar
                dataKey="patients"
                name="Patients"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
