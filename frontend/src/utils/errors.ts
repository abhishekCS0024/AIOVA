/** Human-readable message from an RTK Query error. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error || typeof error !== "object") return fallback;
  const e = error as { status?: number | string; data?: { detail?: unknown } };
  const detail = e.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? String(d)).join("; ");
  if (e.status === "FETCH_ERROR") return "Cannot reach the server. Check that the backend is running.";
  return fallback;
}
