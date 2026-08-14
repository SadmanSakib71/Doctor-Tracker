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

  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    query.set("sortOrder", params.sortOrder);
  }

  return query.toString();
}

export async function getDoctors(params) {
  try {
    return await apiRequest(`/doctors?${toQueryString(params)}`);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      throw error;
    }

    if (error.message === "Unable to connect to the server. Please try again.") {
      throw error;
    }

    throw new Error("Unable to load doctors. Please try again.");
  }
}

export async function getDoctor(id) {
  try {
    return await apiRequest(`/doctors/${id}`);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      throw error;
    }

    if (
      error.message === "The requested record was not found." ||
      error.message === "Invalid doctor ID"
    ) {
      throw new Error("Doctor not found.");
    }

    throw new Error("Unable to load doctor details. Please try again.");
  }
}

export async function createDoctor(fields) {
  return apiRequest("/doctors", {
    method: "POST",
    body: fields,
  });
}

export async function updateDoctor(id, fields) {
  return apiRequest(`/doctors/${id}`, {
    method: "PUT",
    body: fields,
  });
}

export async function deleteDoctor(id) {
  return apiRequest(`/doctors/${id}`, {
    method: "DELETE",
  });
}
