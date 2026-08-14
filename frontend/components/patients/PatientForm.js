"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Modal from "@/components/shared/Modal";
import { getPatientDoctorId } from "./PatientCard";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const selectClassName = (error) =>
  `mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${
    error
      ? "border-red-400 focus:border-red-500"
      : "border-slate-300 hover:border-slate-400 focus:border-indigo-500"
  }`;

export default function PatientForm({
  patient,
  lockedDoctor = null,
  doctors = [],
  doctorsLoading = false,
  doctorsError = "",
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(patient);
  const [fields, setFields] = useState({
    name: patient?.name || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    age: patient?.age == null ? "" : String(patient.age),
    gender: patient?.gender || "",
    condition: patient?.condition || "",
    address: patient?.address || "",
    doctorId: lockedDoctor?.id || getPatientDoctorId(patient),
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const formDoctors = (() => {
    const list = [...doctors];
    const currentId = String(fields.doctorId || "");
    const alreadyListed = list.some((doctor) => String(doctor.id) === currentId);

    if (currentId && !alreadyListed && patient?.doctor) {
      list.unshift({
        id: currentId,
        name: patient.doctor.name,
        specialization: patient.doctor.specialization,
      });
    }

    return list;
  })();

  const noDoctors =
    !lockedDoctor && !doctorsLoading && !doctorsError && formDoctors.length === 0;
  const doctorFieldDisabled = Boolean(lockedDoctor) || submitting || doctorsLoading;
  const cannotSubmit =
    noDoctors || doctorsLoading || (Boolean(doctorsError) && !fields.doctorId);

  function handleChange(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (submitting || cannotSubmit) {
      return;
    }

    const trimmed = {
      name: fields.name.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      condition: fields.condition.trim(),
      address: fields.address.trim(),
      gender: fields.gender,
      doctorId: lockedDoctor?.id || fields.doctorId,
    };

    const nextErrors = {};

    if (!trimmed.name) {
      nextErrors.name = "Name is required.";
    }

    if (!trimmed.phone) {
      nextErrors.phone = "Phone is required.";
    }

    if (!trimmed.condition) {
      nextErrors.condition = "Condition is required.";
    }

    if (!trimmed.doctorId) {
      nextErrors.doctorId = "Doctor is required.";
    }

    if (trimmed.email && !isValidEmail(trimmed.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (fields.age !== "") {
      const age = Number(fields.age);

      if (!Number.isInteger(age) || age < 0 || age > 120) {
        nextErrors.age = "Age must be a number between 0 and 120.";
      }
    }

    if (trimmed.gender && !["male", "female", "other"].includes(trimmed.gender)) {
      nextErrors.gender = "Gender must be male, female, or other.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const payload = {
      doctorId: trimmed.doctorId,
      name: trimmed.name,
      phone: trimmed.phone,
      condition: trimmed.condition,
    };

    if (trimmed.email) {
      payload.email = trimmed.email;
    } else if (isEditing) {
      payload.email = "";
    }

    if (trimmed.address) {
      payload.address = trimmed.address;
    } else if (isEditing) {
      payload.address = "";
    }

    if (trimmed.gender) {
      payload.gender = trimmed.gender;
    }

    if (fields.age !== "") {
      payload.age = Number(fields.age);
    }

    onSubmit(payload);
  }

  return (
    <Modal
      open
      title={isEditing ? "Edit Patient" : "Add Patient"}
      onClose={onClose}
      disableClose={submitting}
      wide
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="patient-form"
            loading={submitting}
            disabled={cannotSubmit}
          >
            {submitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Patient"}
          </Button>
        </>
      }
    >
      <form id="patient-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {noDoctors ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800"
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

        {doctorsError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {doctorsError}
          </p>
        ) : null}

        <Input
          id="patient-name"
          name="name"
          label="Name"
          placeholder="John Rahman"
          value={fields.name}
          error={fieldErrors.name}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="patient-email"
          name="email"
          type="email"
          label="Email"
          placeholder="patient@example.com"
          value={fields.email}
          error={fieldErrors.email}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="patient-phone"
          name="phone"
          type="tel"
          label="Phone"
          placeholder="01700000000"
          value={fields.phone}
          error={fieldErrors.phone}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="patient-age"
          name="age"
          type="number"
          min="0"
          max="120"
          step="1"
          label="Age"
          placeholder="e.g. 35"
          value={fields.age}
          error={fieldErrors.age}
          disabled={submitting}
          onChange={handleChange}
        />

        <div>
          <label htmlFor="patient-gender" className="block text-sm font-medium text-slate-700">
            Gender
          </label>
          <select
            id="patient-gender"
            name="gender"
            value={fields.gender}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.gender)}
            aria-describedby={fieldErrors.gender ? "patient-gender-error" : undefined}
            className={selectClassName(fieldErrors.gender)}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {fieldErrors.gender ? (
            <p id="patient-gender-error" className="mt-1.5 text-sm text-red-600">
              {fieldErrors.gender}
            </p>
          ) : null}
        </div>

        <Input
          id="patient-condition"
          name="condition"
          label="Condition"
          placeholder="Diabetes"
          value={fields.condition}
          error={fieldErrors.condition}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="patient-address"
          name="address"
          label="Address"
          placeholder="Dhaka"
          value={fields.address}
          error={fieldErrors.address}
          disabled={submitting}
          onChange={handleChange}
        />

        {lockedDoctor ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            Assigned doctor: <span className="font-medium text-slate-800">{lockedDoctor.name}</span>
          </p>
        ) : (
          <div>
            <label htmlFor="patient-doctorId" className="block text-sm font-medium text-slate-700">
              Doctor
            </label>
            <select
              id="patient-doctorId"
              name="doctorId"
              value={fields.doctorId}
              disabled={doctorFieldDisabled}
              aria-invalid={Boolean(fieldErrors.doctorId)}
              aria-describedby={fieldErrors.doctorId ? "patient-doctorId-error" : undefined}
              className={selectClassName(fieldErrors.doctorId)}
              onChange={handleChange}
            >
              <option value="">
                {doctorsLoading ? "Loading doctors..." : "Select a doctor"}
              </option>
              {formDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                  {doctor.specialization ? ` — ${doctor.specialization}` : ""}
                </option>
              ))}
            </select>
            {fieldErrors.doctorId ? (
              <p id="patient-doctorId-error" className="mt-1.5 text-sm text-red-600">
                {fieldErrors.doctorId}
              </p>
            ) : null}
          </div>
        )}
      </form>
    </Modal>
  );
}
