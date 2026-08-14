"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#4f46e5",
  "#6366f1",
  "#818cf8",
  "#0f766e",
  "#14b8a6",
  "#64748b",
  "#94a3b8",
  "#c7d2fe",
];

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(15 23 42 / 0.06)",
  fontSize: "12px",
};

export default function PatientsByConditionChart({ data }) {
  const rows = Array.isArray(data) ? data : [];
  const isEmpty = rows.length === 0;

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Patients by Condition</h3>
      <p className="mt-1 text-sm text-slate-500">Most common conditions</p>

      {isEmpty ? (
        <p className="mt-16 mb-10 text-center text-sm text-slate-500">
          No condition data available
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_11rem] sm:items-center">
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="condition"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {rows.map((item, index) => (
                    <Cell
                      key={item.condition}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2">
            {rows.map((item, index) => (
              <li
                key={item.condition}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-slate-700">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.condition}</span>
                </span>
                <span className="shrink-0 tabular-nums text-slate-500">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
