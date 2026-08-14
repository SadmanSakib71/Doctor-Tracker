"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";

const EMPTY_FILTERS = {
  doctorId: "",
  condition: "",
  gender: "",
  fromDate: "",
  toDate: "",
};

const selectClassName =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export default function PatientFilters({
  initialValues = EMPTY_FILTERS,
  onApply,
  onClear,
  hasActiveFilters,
  showDoctorFilter = true,
  doctors = [],
  doctorsLoading = false,
  doctorsError = "",
}) {
  const [values, setValues] = useState({
    ...EMPTY_FILTERS,
    ...initialValues,
  });
  const [error, setError] = useState("");

  const canClear = Boolean(
    hasActiveFilters ||
      values.doctorId ||
      values.condition.trim() ||
      values.gender ||
      values.fromDate ||
      values.toDate
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
      setError("From date must be before to date.");
      return;
    }

    setError("");
    onApply({
      doctorId: values.doctorId,
      condition: values.condition.trim(),
      gender: values.gender,
      fromDate: values.fromDate,
      toDate: values.toDate,
    });
  }

  function handleClear() {
    setError("");
    setValues(EMPTY_FILTERS);
    onClear();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showDoctorFilter ? (
          <div>
            <label htmlFor="filter-doctorId" className="block text-sm font-medium text-slate-700">
              Doctor
            </label>
            <select
              id="filter-doctorId"
              name="doctorId"
              value={values.doctorId}
              onChange={handleChange}
              disabled={doctorsLoading}
              className={selectClassName}
            >
              <option value="">
                {doctorsLoading ? "Loading doctors..." : "All doctors"}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                  {doctor.specialization ? ` — ${doctor.specialization}` : ""}
                </option>
              ))}
            </select>
            {doctorsError ? (
              <p className="mt-1.5 text-sm text-red-600">{doctorsError}</p>
            ) : null}
          </div>
        ) : null}

        <Input
          id="filter-condition"
          name="condition"
          label="Condition"
          placeholder="e.g. Diabetes"
          value={values.condition}
          onChange={handleChange}
        />

        <div>
          <label htmlFor="filter-gender" className="block text-sm font-medium text-slate-700">
            Gender
          </label>
          <select
            id="filter-gender"
            name="gender"
            value={values.gender}
            onChange={handleChange}
            className={selectClassName}
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input
          id="filter-fromDate"
          name="fromDate"
          type="date"
          label="From Date"
          value={values.fromDate}
          onChange={handleChange}
        />
        <Input
          id="filter-toDate"
          name="toDate"
          type="date"
          label="To Date"
          value={values.toDate}
          onChange={handleChange}
        />
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={handleClear} disabled={!canClear}>
          Clear
        </Button>
        <Button type="submit">Apply Filters</Button>
      </div>
    </form>
  );
}
