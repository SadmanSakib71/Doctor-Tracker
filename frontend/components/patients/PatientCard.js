import { formatAge, formatDate, formatGender } from "@/lib/format";
import Button from "@/components/shared/Button";

export function getPatientDoctorName(patient) {
  return patient?.doctor?.name || "—";
}

export function getPatientDoctorId(patient) {
  return String(patient?.doctorId || patient?.doctor?.id || "");
}

export function PatientActions({ patient, busy, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className="px-2.5 py-1.5"
        disabled={busy}
        aria-label={`Edit ${patient.name}`}
        onClick={() => onEdit(patient)}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 hover:text-red-800"
        disabled={busy}
        aria-label={`Delete ${patient.name}`}
        onClick={() => onDelete(patient)}
      >
        Delete
      </Button>
    </div>
  );
}

export function PatientCardSkeleton() {
  return (
    <div className="space-y-3 lg:hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-8 w-full animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function PatientCard({ patient, busy, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-base font-semibold text-slate-900">{patient.name}</p>
      <p className="mt-1 text-sm text-slate-600">{patient.condition}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Doctor</dt>
          <dd className="min-w-0 break-words text-slate-800">
            {getPatientDoctorName(patient)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Age</dt>
          <dd className="text-slate-800">{formatAge(patient.age)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Gender</dt>
          <dd className="text-slate-800">{formatGender(patient.gender)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Phone</dt>
          <dd className="min-w-0 break-words text-slate-800">{patient.phone}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Created</dt>
          <dd className="text-slate-800">{formatDate(patient.createdAt)}</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <PatientActions
          patient={patient}
          busy={busy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
