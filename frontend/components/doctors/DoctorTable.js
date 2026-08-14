import { formatDate } from "@/lib/format";
import { DoctorActions } from "./DoctorCard";

function SortButton({ label, field, order, currentSortBy, currentSortOrder, onSort }) {
  const isActive = currentSortBy === field && currentSortOrder === order;
  const direction = order === "asc" ? "ascending" : "descending";

  return (
    <button
      type="button"
      onClick={() => onSort(field, order)}
      aria-pressed={isActive}
      aria-label={`Sort by ${label} ${direction}`}
      className={`rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {label} {order === "asc" ? "↑" : "↓"}
    </button>
  );
}

export function DoctorSortControls({ sortBy, sortOrder, onSort }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-sm text-slate-500">Sort:</span>
      <SortButton
        label="Name"
        field="name"
        order="asc"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
      />
      <SortButton
        label="Name"
        field="name"
        order="desc"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
      />
      <SortButton
        label="Created"
        field="createdAt"
        order="asc"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
      />
      <SortButton
        label="Created"
        field="createdAt"
        order="desc"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
      />
    </div>
  );
}

export function DoctorTableSkeleton() {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="min-w-full divide-y divide-slate-200">
        <div className="grid grid-cols-7 bg-slate-50 px-4 py-3">
          {["Name", "Specialization", "Hospital", "Phone", "Email", "Created", "Actions"].map(
            (heading) => (
              <p key={heading} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {heading}
              </p>
            )
          )}
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-7 gap-3 px-4 py-4">
            {Array.from({ length: 7 }).map((__, cell) => (
              <div key={cell} className="h-4 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DoctorTable({ doctors, busy, onEdit, onDelete }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {["Name", "Specialization", "Hospital", "Phone", "Email", "Created", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {doctors.map((doctor) => (
            <tr key={doctor.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">{doctor.name}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{doctor.specialization}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{doctor.hospital}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{doctor.phone}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{doctor.email}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{formatDate(doctor.createdAt)}</td>
              <td className="px-4 py-3">
                <DoctorActions
                  doctor={doctor}
                  busy={busy}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
