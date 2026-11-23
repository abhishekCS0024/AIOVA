import type { InvestigationDetail } from "@/types/investigation";

/** Props shared by every workspace section. */
export interface WorkspaceProps {
  investigation: InvestigationDetail;
  /** Approved or closed: content is read-only (enforced by the backend too). */
  locked: boolean;
  isQA: boolean;
}

export const isLocked = (inv: InvestigationDetail) => inv.status === "approved" || inv.status === "closed";
export const hasDraft = (inv: InvestigationDetail) => Object.keys(inv.ai_draft ?? {}).length > 0;
