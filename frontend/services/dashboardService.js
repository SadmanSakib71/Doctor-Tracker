import { apiRequest } from "@/lib/api";

export async function getDashboardSummary() {
  try {
    return await apiRequest("/dashboard/summary");
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      throw error;
    }

    if (error.message === "Unable to connect to the server. Please try again.") {
      throw error;
    }

    throw new Error("Unable to load dashboard data.");
  }
}
