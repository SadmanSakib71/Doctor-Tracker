import Link from "next/link";
import { formatDate } from "@/lib/format";
import Button from "@/components/shared/Button";

export function DoctorActions({ doctor, busy, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/doctors/${doctor.id}/patients`}
        aria-label={`View patients for ${doctor.name}`}
        className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        View Patients
      </Link>
      <Button
        type="button"
        variant="secondary"
        className="px-2.5 py-1.5"
        disabled={busy}
        aria-label={`Edit ${doctor.name}`}
        onClick={() => onEdit(doctor)}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 hover:text-red-800"
        disabled={busy}
        aria-label={`Delete ${doctor.name}`}
        onClick={() => onDelete(doctor)}
      >
        Delete
      </Button>
    </div>
  );
}

export function DoctorCardSkeleton() {
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

export default function DoctorCard({ doctor, busy, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-base font-semibold text-slate-900">{doctor.name}</p>
      <p className="mt-1 text-sm text-slate-600">{doctor.specialization}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Hospital</dt>
          <dd className="min-w-0 break-words text-slate-800">{doctor.hospital}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Phone</dt>
          <dd className="min-w-0 break-words text-slate-800">{doctor.phone}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Email</dt>
          <dd className="min-w-0 break-all text-slate-800">{doctor.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Created</dt>
          <dd className="text-slate-800">{formatDate(doctor.createdAt)}</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <DoctorActions doctor={doctor} busy={busy} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}
