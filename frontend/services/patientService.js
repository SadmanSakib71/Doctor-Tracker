import { apiRequest } from "@/lib/api";

const DEFAULT_LIMIT = 10;

function toQueryString(params = {}) {
  const query = new URLSearchParams();
  const page = params.page || 1;
  const limit = params.limit || DEFAULT_LIMIT;

  query.set("page", String(page));
  query.set("limit", String(limit));

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

  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    query.set("sortOrder", params.sortOrder);
  }

  return query.toString();
}

export async function getPatients(params) {
  try {
    return await apiRequest(`/patients?${toQueryString(params)}`);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      throw error;
    }

    if (error.message === "Unable to connect to the server. Please try again.") {
      throw error;
    }

    throw new Error("Unable to load patients. Please try again.");
  }
}

export async function getPatientsByDoctor(doctorId, params) {
  try {
    const queryParams = { ...params };
    delete queryParams.doctorId;

    return await apiRequest(
      `/doctors/${doctorId}/patients?${toQueryString(queryParams)}`
    );
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      throw error;
    }

    if (error.message === "Unable to connect to the server. Please try again.") {
      throw error;
    }

    if (
      error.message === "Doctor not found" ||
      error.message === "Doctor not found." ||
      error.message === "The requested record was not found." ||
      error.message === "Invalid doctor ID"
    ) {
      throw new Error("Doctor not found.");
    }

    throw new Error("Unable to load patients. Please try again.");
  }
}

export async function createPatient(fields) {
  return apiRequest("/patients", {
    method: "POST",
    body: fields,
  });
}

export async function updatePatient(id, fields) {
  return apiRequest(`/patients/${id}`, {
    method: "PUT",
    body: fields,
  });
}

export async function deletePatient(id) {
  return apiRequest(`/patients/${id}`, {
    method: "DELETE",
  });
}
