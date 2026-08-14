import { clearAuth, getToken } from "@/lib/auth";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class UnauthorizedError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
  }
}

function isSafeErrorMessage(message) {
  if (!message || typeof message !== "string") {
    return false;
  }

  if (message.length > 180) {
    return false;
  }

  const lower = message.toLowerCase();

  return (
    !lower.includes("mongo") &&
    !lower.includes("e11000") &&
    !lower.includes("stack") &&
    !lower.includes("cast to")
  );
}

function getFriendlyError(status, fallbackMessage) {
  if (status === 400) {
    return fallbackMessage || "Please check the form and try again.";
  }

  if (status === 404) {
    return "The requested record was not found.";
  }

  if (status >= 500) {
    return "Something went wrong. Please try again.";
  }

  return fallbackMessage || "Something went wrong. Please try again.";
}

export function handleUnauthorized(error, router) {
  if (error instanceof UnauthorizedError) {
    clearAuth();
    router.replace("/login");
    return true;
  }

  return false;
}

export async function apiRequest(endpoint, options = {}) {
  const { body, headers: customHeaders = {}, ...rest } = options;
  const headers = { ...customHeaders };
  const token = getToken();

  if (body !== undefined && typeof body !== "string") {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers,
      body:
        body !== undefined && typeof body !== "string"
          ? JSON.stringify(body)
          : body,
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const backendMessage = isSafeErrorMessage(payload?.message)
      ? payload.message
      : "";

    throw new Error(getFriendlyError(response.status, backendMessage));
  }

  return payload;
}
