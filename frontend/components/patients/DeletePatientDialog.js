"use client";

import { useRef } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";

export default function DeletePatientDialog({
  open,
  patient,
  submitting,
  error,
  onClose,
  onConfirm,
}) {
  const cancelRef = useRef(null);

  return (
    <Modal
      open={open}
      title="Delete Patient?"
      onClose={onClose}
      disableClose={submitting}
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={submitting} onClick={onConfirm}>
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete this patient?
      </p>
      {patient?.name ? (
        <p className="mt-2 text-sm font-medium text-slate-800">{patient.name}</p>
      ) : null}
      <p className="mt-3 text-sm text-slate-600">This action cannot be undone.</p>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
