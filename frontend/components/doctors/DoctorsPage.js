"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/shared/Button";
import Notification from "@/components/shared/Notification";
import { handleUnauthorized } from "@/lib/api";
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from "@/services/doctorService";
import DoctorCard, { DoctorCardSkeleton } from "./DoctorCard";
import DeleteDoctorDialog from "./DeleteDoctorDialog";
import DoctorFilters from "./DoctorFilters";
import DoctorForm from "./DoctorForm";
import DoctorTable, { DoctorSortControls, DoctorTableSkeleton } from "./DoctorTable";

const DEFAULT_LIMIT = 10;
const SEARCH_DELAY_MS = 400;

function readListParams(searchParams) {
  const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);

  return {
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    search: searchParams.get("search") || "",
    specialization: searchParams.get("specialization") || "",
    hospital: searchParams.get("hospital") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    sortBy: searchParams.get("sortBy") === "name" ? "name" : "createdAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  };
}

function buildDoctorsUrl(params) {
  const query = new URLSearchParams();

  if (params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.specialization) {
    query.set("specialization", params.specialization);
  }

  if (params.hospital) {
    query.set("hospital", params.hospital);
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
  return queryString ? `/doctors?${queryString}` : "/doctors";
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

export default function DoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const params = useMemo(
    () => readListParams(new URLSearchParams(queryString)),
    [queryString]
  );

  const [doctors, setDoctors] = useState([]);
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [notification, setNotification] = useState("");
  const [notificationKey, setNotificationKey] = useState(0);

  const hasActiveFilters = Boolean(
    params.search ||
      params.specialization ||
      params.hospital ||
      params.fromDate ||
      params.toDate
  );

  const filterKey = [
    params.specialization,
    params.hospital,
    params.fromDate,
    params.toDate,
  ].join("|");

  const navigate = useCallback(
    (nextParams, { replace = false } = {}) => {
      const url = buildDoctorsUrl(nextParams);
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router]
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
    let cancelled = false;

    async function loadDoctors() {
      setLoading(true);
      setError("");

      try {
        const result = await getDoctors({
          page: params.page,
          limit: DEFAULT_LIMIT,
          search: params.search,
          specialization: params.specialization,
          hospital: params.hospital,
          fromDate: params.fromDate,
          toDate: params.toDate,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
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

        setDoctors(result.data || []);
        setPagination(nextPagination);
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (handleUnauthorized(err, router)) {
          return;
        }

        setDoctors([]);
        setError(err.message || "Unable to load doctors. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, [params, reloadToken, navigate, router]);

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
      specialization: nextFilters.specialization,
      hospital: nextFilters.hospital,
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
      specialization: "",
      hospital: "",
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

  function openAddForm() {
    setEditingDoctor(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(doctor) {
    setEditingDoctor(doctor);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingDoctor(null);
    setFormError("");
  }

  async function handleFormSubmit(fields) {
    if (formSubmitting) {
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, fields);
        notify("Doctor updated successfully.");
      } else {
        await createDoctor(fields);
        notify("Doctor added successfully.");
      }

      setFormOpen(false);
      setEditingDoctor(null);
      refreshList();
    } catch (err) {
      if (handleUnauthorized(err, router)) {
        return;
      }

      setFormError(err.message || "Unable to save doctor. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  }

  function openDeleteDialog(doctor) {
    setDoctorToDelete(doctor);
    setDeleteError("");
  }

  function closeDeleteDialog() {
    if (deleteSubmitting) {
      return;
    }

    setDoctorToDelete(null);
    setDeleteError("");
  }

  async function handleDeleteConfirm() {
    if (!doctorToDelete || deleteSubmitting) {
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      await deleteDoctor(doctorToDelete.id);
      setDoctorToDelete(null);
      notify("Doctor deleted successfully.");

      if (doctors.length === 1 && params.page > 1) {
        navigate({ ...params, page: params.page - 1 });
      } else {
        refreshList();
      }
    } catch (err) {
      if (handleUnauthorized(err, router)) {
        return;
      }

      setDeleteError(err.message || "Unable to delete doctor. Please try again.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const from =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);
  const visiblePages = getVisiblePages(pagination.page, pagination.totalPages);
  const mutating = formSubmitting || deleteSubmitting;
  const showEmpty = !loading && !error && doctors.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Doctors</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage doctors and their patient records.
          </p>
        </div>
        <Button type="button" onClick={openAddForm} className="shrink-0">
          <PlusIcon />
          Add Doctor
        </Button>
      </div>

      <div>
        <label className="sr-only" htmlFor="doctor-search">
          Search doctors
        </label>
        <input
          id="doctor-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search doctors..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
        />
      </div>

      <DoctorFilters
        key={filterKey}
        initialValues={{
          specialization: params.specialization,
          hospital: params.hospital,
          fromDate: params.fromDate,
          toDate: params.toDate,
        }}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DoctorSortControls
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={handleSort}
        />
        {!loading && !error && pagination.total > 0 ? (
          <p className="text-sm text-slate-500">
            Showing {from}–{to} of {pagination.total} doctors
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
          <DoctorTableSkeleton />
          <DoctorCardSkeleton />
        </>
      ) : null}

      {!loading && !error && doctors.length > 0 ? (
        <>
          <DoctorTable
            doctors={doctors}
            busy={mutating}
            onEdit={openEditForm}
            onDelete={openDeleteDialog}
          />
          <ul className="space-y-3 lg:hidden">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <DoctorCard
                  doctor={doctor}
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
          <p className="text-base font-semibold text-slate-900">
            {hasActiveFilters ? "No doctors found" : "No doctors yet"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {hasActiveFilters
              ? "Try changing your search or filters."
              : "Add a doctor to start managing patient records."}
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {hasActiveFilters ? (
              <Button type="button" variant="secondary" onClick={handleClearFilters}>
                Clear search and filters
              </Button>
            ) : null}
            <Button type="button" onClick={openAddForm}>
              <PlusIcon />
              Add Doctor
            </Button>
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
        <DoctorForm
          doctor={editingDoctor}
          submitting={formSubmitting}
          error={formError}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      <DeleteDoctorDialog
        open={Boolean(doctorToDelete)}
        doctor={doctorToDelete}
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
