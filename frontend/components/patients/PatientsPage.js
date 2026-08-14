"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/shared/Button";
import Notification from "@/components/shared/Notification";
import { handleUnauthorized } from "@/lib/api";
import { getDoctor, getDoctors } from "@/services/doctorService";
import {
  createPatient,
  deletePatient,
  getPatients,
  getPatientsByDoctor,
  updatePatient,
} from "@/services/patientService";
import DeletePatientDialog from "./DeletePatientDialog";
import PatientCard, { PatientCardSkeleton } from "./PatientCard";
import PatientFilters from "./PatientFilters";
import PatientForm from "./PatientForm";
import PatientTable, {
  PatientSortControls,
  PatientTableSkeleton,
} from "./PatientTable";

const DEFAULT_LIMIT = 10;
const SEARCH_DELAY_MS = 400;
const ALLOWED_GENDERS = ["male", "female", "other"];
const ALLOWED_SORT_FIELDS = ["createdAt", "name", "age"];

function readListParams(searchParams) {
  const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const gender = searchParams.get("gender") || "";
  const sortBy = searchParams.get("sortBy") || "";

  return {
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    search: searchParams.get("search") || "",
    doctorId: searchParams.get("doctorId") || "",
    condition: searchParams.get("condition") || "",
    gender: ALLOWED_GENDERS.includes(gender) ? gender : "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    sortBy: ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  };
}

function buildPatientsUrl(params, basePath) {
  const query = new URLSearchParams();

  if (params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.doctorId) {
    query.set("doctorId", params.doctorId);
  }

  if (params.condition) {
    query.set("condition", params.condition);
  }

  if (params.gender) {
    query.set("gender", params.gender);
  }

  if (params.fromDate) {
    query.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    query.set("toDate", params.toDate);
  }

  if (params.sortBy !== "createdAt") {
    query.set("sortBy", params.sortBy);
  }

  if (params.sortOrder !== "desc") {
    query.set("sortOrder", params.sortOrder);
  }

  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function getVisiblePages(current, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(1, current - 2);
  let end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function formatDoctorHeading(name) {
  if (!name) {
    return "Doctor";
  }

  return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PatientsPageFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200" />
      <div className="h-48 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function PatientsPage({ lockedDoctor = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const params = useMemo(
    () => readListParams(new URLSearchParams(queryString)),
    [queryString]
  );

  const basePath = lockedDoctor
    ? `/doctors/${lockedDoctor.id}/patients`
    : "/patients";

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [searchInput, setSearchInput] = useState(params.search);
  const lastSentSearch = useRef(params.search);

  const [doctorOptions, setDoctorOptions] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(!lockedDoctor);
  const [doctorsError, setDoctorsError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [notification, setNotification] = useState("");
  const [notificationKey, setNotificationKey] = useState(0);

  const hasActiveFilters = Boolean(
    params.search ||
      (!lockedDoctor && params.doctorId) ||
      params.condition ||
      params.gender ||
      params.fromDate ||
      params.toDate
  );

  const filterKey = [
    lockedDoctor ? "" : params.doctorId,
    params.condition,
    params.gender,
    params.fromDate,
    params.toDate,
  ].join("|");

  const navigate = useCallback(
    (nextParams, { replace = false } = {}) => {
      const urlParams = lockedDoctor
        ? { ...nextParams, doctorId: "" }
        : nextParams;
      const url = buildPatientsUrl(urlParams, basePath);

      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, basePath, lockedDoctor]
  );

  useEffect(() => {
    if (params.search === lastSentSearch.current) {
      return;
    }

    lastSentSearch.current = params.search;
    setSearchInput(params.search);
  }, [params.search]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const timer = window.setTimeout(() => {
      if (trimmed === params.search) {
        return;
      }

      lastSentSearch.current = trimmed;
      navigate(
        {
          ...params,
          search: trimmed,
          page: 1,
        },
        { replace: true }
      );
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, params, navigate]);

  useEffect(() => {
    if (lockedDoctor) {
      return undefined;
    }

    let cancelled = false;

    async function loadDoctors() {
      setDoctorsLoading(true);
      setDoctorsError("");

      try {
        const result = await getDoctors({
          page: 1,
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        });

        if (!cancelled) {
          setDoctorOptions(result.data || []);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (handleUnauthorized(err, router)) {
          return;
        }

        setDoctorOptions([]);
        setDoctorsError(err.message || "Unable to load doctors. Please try again.");
      } finally {
        if (!cancelled) {
          setDoctorsLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, [lockedDoctor, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setLoading(true);
      setError("");

      try {
        const listParams = {
          page: params.page,
          limit: DEFAULT_LIMIT,
          search: params.search,
          condition: params.condition,
          gender: params.gender,
          fromDate: params.fromDate,
          toDate: params.toDate,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        };

        const result = lockedDoctor
          ? await getPatientsByDoctor(lockedDoctor.id, listParams)
          : await getPatients({
              ...listParams,
              doctorId: params.doctorId,
            });

        if (cancelled) {
          return;
        }

        const nextPagination = result.pagination || {
          page: params.page,
          limit: DEFAULT_LIMIT,
          total: 0,
          totalPages: 0,
        };

        if (
          Array.isArray(result.data) &&
          result.data.length === 0 &&
          nextPagination.page > 1 &&
          nextPagination.totalPages > 0
        ) {
          navigate({ ...params, page: nextPagination.totalPages });
          return;
        }

        setPatients(result.data || []);
        setPagination(nextPagination);
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (handleUnauthorized(err, router)) {
          return;
        }

        setPatients([]);
        setError(err.message || "Unable to load patients. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [params, reloadToken, navigate, router, lockedDoctor]);

  function notify(message) {
    setNotification(message);
    setNotificationKey((current) => current + 1);
  }

  function refreshList() {
    setReloadToken((current) => current + 1);
  }

  function handleSearchKeyDown(event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const trimmed = searchInput.trim();
    lastSentSearch.current = trimmed;
    navigate(
      {
        ...params,
        search: trimmed,
        page: 1,
      },
      { replace: true }
    );
  }

  function handleApplyFilters(nextFilters) {
    navigate({
      ...params,
      doctorId: lockedDoctor ? "" : nextFilters.doctorId,
      condition: nextFilters.condition,
      gender: nextFilters.gender,
      fromDate: nextFilters.fromDate,
      toDate: nextFilters.toDate,
      page: 1,
    });
  }

  function handleClearFilters() {
    setSearchInput("");
    lastSentSearch.current = "";
    navigate({
      ...params,
      search: "",
      doctorId: "",
      condition: "",
      gender: "",
      fromDate: "",
      toDate: "",
      page: 1,
    });
  }

  function handleSort(sortBy, sortOrder) {
    navigate({
      ...params,
      sortBy,
      sortOrder,
      page: 1,
    });
  }

  function handlePageChange(page) {
    if (page < 1 || page > pagination.totalPages || page === params.page) {
      return;
    }

    navigate({ ...params, page });
  }

  const noDoctorsAvailable =
    !lockedDoctor && !doctorsLoading && !doctorsError && doctorOptions.length === 0;

  function openAddForm() {
    if (noDoctorsAvailable) {
      return;
    }

    setEditingPatient(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(patient) {
    setEditingPatient(patient);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingPatient(null);
    setFormError("");
  }

  async function handleFormSubmit(fields) {
    if (formSubmitting) {
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      const payload = lockedDoctor
        ? { ...fields, doctorId: lockedDoctor.id }
        : fields;

      if (editingPatient) {
        await updatePatient(editingPatient.id, payload);
        notify("Patient updated successfully.");
      } else {
        await createPatient(payload);
        notify("Patient added successfully.");
      }

      setFormOpen(false);
      setEditingPatient(null);
      refreshList();
    } catch (err) {
      if (handleUnauthorized(err, router)) {
        return;
      }

      setFormError(err.message || "Unable to save patient. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  }

  function openDeleteDialog(patient) {
    setPatientToDelete(patient);
    setDeleteError("");
  }

  function closeDeleteDialog() {
    if (deleteSubmitting) {
      return;
    }

    setPatientToDelete(null);
    setDeleteError("");
  }

  async function handleDeleteConfirm() {
    if (!patientToDelete || deleteSubmitting) {
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      await deletePatient(patientToDelete.id);
      setPatientToDelete(null);
      notify("Patient deleted successfully.");

      if (patients.length === 1 && params.page > 1) {
        navigate({ ...params, page: params.page - 1 });
      } else {
        refreshList();
      }
    } catch (err) {
      if (handleUnauthorized(err, router)) {
        return;
      }

      setDeleteError(err.message || "Unable to delete patient. Please try again.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const from =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);
  const visiblePages = getVisiblePages(pagination.page, pagination.totalPages);
  const mutating = formSubmitting || deleteSubmitting;
  const showEmpty = !loading && !error && patients.length === 0;

  let emptyTitle = "No patients yet";
  let emptyDescription = "Add a patient to start managing records.";

  if (hasActiveFilters) {
    emptyTitle = "No patients found";
    emptyDescription = "Try changing your search or filters.";
  } else if (lockedDoctor) {
    emptyTitle = "No patients assigned to this doctor.";
    emptyDescription = "Add a patient to assign them to this doctor.";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {lockedDoctor ? (
            <Link
              href="/doctors"
              className="inline-flex items-center rounded-md text-sm font-medium text-indigo-700 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              ← Back to Doctors
            </Link>
          ) : null}
          <h2 className={`text-xl font-semibold text-slate-900 ${lockedDoctor ? "mt-3" : ""}`}>
            {lockedDoctor ? formatDoctorHeading(lockedDoctor.name) : "Patients"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {lockedDoctor
              ? "Patients"
              : "Manage patients and their assigned doctors."}
          </p>
        </div>
        <Button
          type="button"
          onClick={openAddForm}
          className="shrink-0"
          disabled={noDoctorsAvailable}
        >
          <PlusIcon />
          Add Patient
        </Button>
      </div>

      {noDoctorsAvailable ? (
        <p
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="status"
        >
          No doctors available. Please{" "}
          <Link
            href="/doctors"
            className="font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            create a doctor
          </Link>{" "}
          first.
        </p>
      ) : null}

      <div>
        <label className="sr-only" htmlFor="patient-search">
          Search patients
        </label>
        <input
          id="patient-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search patients..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
        />
      </div>

      <PatientFilters
        key={filterKey}
        initialValues={{
          doctorId: lockedDoctor ? "" : params.doctorId,
          condition: params.condition,
          gender: params.gender,
          fromDate: params.fromDate,
          toDate: params.toDate,
        }}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        showDoctorFilter={!lockedDoctor}
        doctors={doctorOptions}
        doctorsLoading={doctorsLoading}
        doctorsError={doctorsError}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PatientSortControls
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={handleSort}
        />
        {!loading && !error && pagination.total > 0 ? (
          <p className="text-sm text-slate-500">
            Showing {from}–{to} of {pagination.total} patients
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <p>{error}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={refreshList}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {loading ? (
        <>
          <PatientTableSkeleton />
          <PatientCardSkeleton />
        </>
      ) : null}

      {!loading && !error && patients.length > 0 ? (
        <>
          <PatientTable
            patients={patients}
            busy={mutating}
            onEdit={openEditForm}
            onDelete={openDeleteDialog}
          />
          <ul className="space-y-3 lg:hidden">
            {patients.map((patient) => (
              <li key={patient.id}>
                <PatientCard
                  patient={patient}
                  busy={mutating}
                  onEdit={openEditForm}
                  onDelete={openDeleteDialog}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {showEmpty ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-slate-900">{emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {hasActiveFilters ? (
              <Button type="button" variant="secondary" onClick={handleClearFilters}>
                Clear search and filters
              </Button>
            ) : null}
            {noDoctorsAvailable ? (
              <Button type="button" onClick={() => router.push("/doctors")}>
                Go to Doctors
              </Button>
            ) : (
              <Button type="button" onClick={openAddForm}>
                <PlusIcon />
                Add Patient
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {!loading && !error && pagination.totalPages > 1 ? (
        <nav
          className="flex flex-col items-center justify-between gap-3 sm:flex-row"
          aria-label="Pagination"
        >
          <p className="text-sm text-slate-500 sm:hidden">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            {visiblePages.map((page) => (
              <Button
                key={page}
                type="button"
                variant={page === pagination.page ? "primary" : "secondary"}
                className="min-w-10 px-3 py-2"
                aria-label={`Page ${page}`}
                aria-current={page === pagination.page ? "page" : undefined}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}

      {formOpen ? (
        <PatientForm
          patient={editingPatient}
          lockedDoctor={lockedDoctor}
          doctors={doctorOptions}
          doctorsLoading={doctorsLoading}
          doctorsError={doctorsError}
          submitting={formSubmitting}
          error={formError}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      <DeletePatientDialog
        open={Boolean(patientToDelete)}
        patient={patientToDelete}
        submitting={deleteSubmitting}
        error={deleteError}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />

      <Notification
        key={notificationKey}
        message={notification}
        onClose={() => setNotification("")}
      />
    </div>
  );
}

export function DoctorPatientsPage() {
  const router = useRouter();
  const routeParams = useParams();
  const doctorId = routeParams?.id;
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

  if (loading) {
    return <PatientsPageFallback />;
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/doctors"
          className="inline-flex items-center rounded-md text-sm font-medium text-indigo-700 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          ← Back to Doctors
        </Link>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <p>{error || "Doctor not found."}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => router.push("/doctors")}
          >
            Return to Doctors
          </Button>
        </div>
      </div>
    );
  }

  return <PatientsPage lockedDoctor={doctor} />;
}

export { PatientsPageFallback };
