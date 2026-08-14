"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Modal from "@/components/shared/Modal";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DoctorForm({
  doctor,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(doctor);
  const [fields, setFields] = useState({
    name: doctor?.name || "",
    specialization: doctor?.specialization || "",
    hospital: doctor?.hospital || "",
    phone: doctor?.phone || "",
    email: doctor?.email || "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmed = {
      name: fields.name.trim(),
      specialization: fields.specialization.trim(),
      hospital: fields.hospital.trim(),
      phone: fields.phone.trim(),
      email: fields.email.trim(),
    };

    const nextErrors = {};

    if (!trimmed.name) {
      nextErrors.name = "Name is required.";
    }

    if (!trimmed.specialization) {
      nextErrors.specialization = "Specialization is required.";
    }

    if (!trimmed.hospital) {
      nextErrors.hospital = "Hospital is required.";
    }

    if (!trimmed.phone) {
      nextErrors.phone = "Phone is required.";
    }

    if (!trimmed.email) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(trimmed.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    onSubmit(trimmed);
  }

  return (
    <Modal
      open
      title={isEditing ? "Edit Doctor" : "Add Doctor"}
      onClose={onClose}
      disableClose={submitting}
      wide
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" loading={submitting}>
            {submitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Doctor"}
          </Button>
        </>
      }
    >
      <form id="doctor-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Input
          id="doctor-name"
          name="name"
          label="Name"
          placeholder="Dr. Jane Smith"
          value={fields.name}
          error={fieldErrors.name}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="doctor-specialization"
          name="specialization"
          label="Specialization"
          placeholder="Cardiology"
          value={fields.specialization}
          error={fieldErrors.specialization}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="doctor-hospital"
          name="hospital"
          label="Hospital"
          placeholder="City General Hospital"
          value={fields.hospital}
          error={fieldErrors.hospital}
          disabled={submitting}
          onChange={handleChange}
        />
        <Input
          id="doctor-phone"
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
          id="doctor-email"
          name="email"
          type="email"
          label="Email"
          placeholder="doctor@hospital.com"
          value={fields.email}
          error={fieldErrors.email}
          disabled={submitting}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
}
