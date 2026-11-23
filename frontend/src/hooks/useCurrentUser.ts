import { DEMO_USERS, getCurrentUserId } from "@/config/users";

export function useCurrentUser() {
  const id = getCurrentUserId();
  const user = DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
  return { ...user, isQA: user.role === "qa_approver" };
}

export function userName(id: string | null): string {
  if (!id) return "AI pipeline";
  return DEMO_USERS.find((u) => u.id === id)?.name ?? "Unknown user";
}
