import { API_URL } from "@/lib/api";

function getFriendlyLoginError(status) {
  if (status === 401) {
    return "Invalid email or password.";
  }

  if (status === 400) {
    return "Email and password are required.";
  }

  return "Unable to sign in. Please try again.";
}

export async function loginRequest(email, password) {
  let response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    throw new Error("Something went wrong. Please try again.");
  }

  if (!response.ok) {
    throw new Error(getFriendlyLoginError(response.status));
  }

  const token = payload?.data?.token;
  const user = payload?.data?.user;

  if (!token || !user) {
    throw new Error("Unable to sign in. Please try again.");
  }

  return { token, user };
}
