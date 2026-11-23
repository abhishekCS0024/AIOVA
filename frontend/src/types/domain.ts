export type Role = "investigator" | "qa_approver";
export type Severity = "critical" | "major" | "minor";
export type InvestigationStatus = "draft" | "in_review" | "approved" | "closed";
export type RootCauseStatus = "suggested" | "confirmed" | "rejected";
export type CauseType = "root_cause" | "contributing_factor";
export type Confidence = "high" | "medium" | "low";
export type CapaType = "corrective" | "preventive";
export type CapaStatus = "proposed" | "accepted" | "in_progress" | "completed" | "verified";
export type SourceType = "pdf" | "text" | "email";
export type ChangeSource = "ai" | "user";
export type PipelineStep = "extract" | "gaps" | "analyze" | "causes" | "capa";
export type FishboneCategory =
  | "Man"
  | "Machine"
  | "Method"
  | "Material"
  | "Measurement"
  | "Mother Nature";

export interface EvidenceRef {
  document: string;
  quote: string;
  supports: boolean;
}
