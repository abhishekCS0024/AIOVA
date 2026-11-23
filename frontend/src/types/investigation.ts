import type {
  CapaStatus,
  CapaType,
  CauseType,
  ChangeSource,
  Confidence,
  EvidenceRef,
  FishboneCategory,
  InvestigationStatus,
  RootCauseStatus,
  Severity,
  SourceType,
} from "@/types/domain";

export interface FormData {
  deviation_title?: string | null;
  deviation_date?: string | null;
  product?: string | null;
  batch_no?: string | null;
  equipment_id?: string | null;
  process_step?: string | null;
  description?: string | null;
  immediate_actions?: string | null;
  proposed_severity?: Severity | null;
}

export interface WhyStep {
  level: number;
  question: string;
  answer: string;
  evidence_refs: EvidenceRef[];
}

export type Fishbone = Partial<
  Record<FishboneCategory, { description: string; evidence_refs: EvidenceRef[] }[]>
>;

export interface Gap {
  item: string;
  why_it_matters: string;
  priority: "high" | "medium" | "low";
}

export interface SourceDocument {
  id: string;
  type: SourceType;
  filename: string | null;
  extracted_text: string;
  created_at: string;
}

export interface RootCause {
  id: string;
  type: CauseType;
  rank: number | null;
  category: FishboneCategory;
  description: string;
  confidence: Confidence;
  evidence_refs: EvidenceRef[];
  missing_evidence: string[];
  status: RootCauseStatus;
  source: ChangeSource;
  confirmed_by: string | null;
}

export interface CapaAction {
  id: string;
  root_cause_id: string;
  type: CapaType;
  action: string;
  rationale: string | null;
  owner: string | null;
  due_date: string | null;
  effectiveness_check: string | null;
  status: CapaStatus;
  source: ChangeSource;
}

export interface InvestigationSummary {
  id: string;
  deviation_no: string;
  title: string | null;
  status: InvestigationStatus;
  severity: Severity | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface InvestigationDetail extends InvestigationSummary {
  form_data: FormData;
  ai_draft: Record<string, unknown>;
  five_whys: WhyStep[];
  fishbone: Fishbone;
  missing_evidence: Gap[];
  documents: SourceDocument[];
  root_causes: RootCause[];
  capa_actions: CapaAction[];
}

export interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  field: string | null;
  old_value: unknown;
  new_value: unknown;
  source: ChangeSource;
  at: string;
}

export interface AnalysisRunResponse {
  investigation_id: string;
  thread_id: string;
  completed_steps: string[];
  awaiting_review: boolean;
  draft: Record<string, unknown>;
}
