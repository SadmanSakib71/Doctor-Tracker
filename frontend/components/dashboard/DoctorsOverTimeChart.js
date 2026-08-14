"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartDate } from "@/lib/format";

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(15 23 42 / 0.06)",
  fontSize: "12px",
};

export default function DoctorsOverTimeChart({ data }) {
  const rows = Array.isArray(data) ? data : [];
  const isEmpty = rows.length === 0 || rows.every((row) => row.count === 0);

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Doctors over Time</h3>
      <p className="mt-1 text-sm text-slate-500">Doctors added in the last 30 days</p>

      {isEmpty ? (
        <p className="mt-16 mb-10 text-center text-sm text-slate-500">
          No doctors added in the last 30 days.
        </p>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                minTickGap={28}
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
                contentStyle={tooltipStyle}
                labelFormatter={(label) => formatChartDate(label)}
                formatter={(value) => [value, "Doctors"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Doctors"
                stroke="#0f766e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#0f766e" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
