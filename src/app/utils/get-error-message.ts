import axios from "axios";

/**
 * Extract a user-facing error message from an unknown caught value.
 * Prefers the server-supplied `response.data.message` for Axios errors,
 * falls back to `Error.message`, and finally to the provided default.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
