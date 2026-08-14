import { formatAge, formatDate, formatGender } from "@/lib/format";
import { getPatientDoctorName, PatientActions } from "./PatientCard";

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

export function PatientSortControls({ sortBy, sortOrder, onSort }) {
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
        label="Age"
        field="age"
        order="asc"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
      />
      <SortButton
        label="Age"
        field="age"
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

export function PatientTableSkeleton() {
  const headings = [
    "Name",
    "Age",
    "Gender",
    "Condition",
    "Phone",
    "Doctor",
    "Created",
    "Actions",
  ];

  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="min-w-full divide-y divide-slate-200">
        <div className="grid grid-cols-8 bg-slate-50 px-4 py-3">
          {headings.map((heading) => (
            <p
              key={heading}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {heading}
            </p>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-8 gap-3 px-4 py-4">
            {Array.from({ length: 8 }).map((__, cell) => (
              <div key={cell} className="h-4 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PatientTable({ patients, busy, onEdit, onDelete }) {
  const headings = [
    "Name",
    "Age",
    "Gender",
    "Condition",
    "Phone",
    "Doctor",
    "Created",
    "Actions",
  ];

  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {patient.name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {formatAge(patient.age)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {formatGender(patient.gender)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {patient.condition}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{patient.phone}</td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {getPatientDoctorName(patient)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {formatDate(patient.createdAt)}
              </td>
              <td className="px-4 py-3">
                <PatientActions
                  patient={patient}
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
