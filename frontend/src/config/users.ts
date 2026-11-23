// Prototype identities, matching backend/app/seed.py. Replace with real auth.
export const DEMO_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Demo Investigator", role: "investigator" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Demo QA Approver", role: "qa_approver" },
] as const;

const KEY = "rca.currentUserId";

export function getCurrentUserId(): string {
  try {
    return localStorage.getItem(KEY) ?? DEMO_USERS[0].id;
  } catch {
    return DEMO_USERS[0].id;
  }
}

export function setCurrentUserId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}
