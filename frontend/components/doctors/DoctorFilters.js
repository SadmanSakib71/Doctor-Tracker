"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";

const EMPTY_FILTERS = {
  specialization: "",
  hospital: "",
  fromDate: "",
  toDate: "",
};

export default function DoctorFilters({
  initialValues = EMPTY_FILTERS,
  onApply,
  onClear,
  hasActiveFilters,
}) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");

  const canClear = Boolean(
    hasActiveFilters ||
      values.specialization.trim() ||
      values.hospital.trim() ||
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
      specialization: values.specialization.trim(),
      hospital: values.hospital.trim(),
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="filter-specialization"
          name="specialization"
          label="Specialization"
          placeholder="e.g. Cardiology"
          value={values.specialization}
          onChange={handleChange}
        />
        <Input
          id="filter-hospital"
          name="hospital"
          label="Hospital"
          placeholder="e.g. Square Hospital"
          value={values.hospital}
          onChange={handleChange}
        />
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
