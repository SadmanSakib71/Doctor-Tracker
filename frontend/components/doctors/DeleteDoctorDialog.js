"use client";

import { useRef } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";

export default function DeleteDoctorDialog({
  open,
  doctor,
  submitting,
  error,
  onClose,
  onConfirm,
}) {
  const cancelRef = useRef(null);
  const name = doctor?.name || "this doctor";

  return (
    <Modal
      open={open}
      title="Delete Doctor?"
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
        Are you sure you want to delete {name}? This action cannot be undone.
      </p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
        Deleting a doctor does not delete their patients.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
