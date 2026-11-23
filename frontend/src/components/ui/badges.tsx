import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Circle,
  CircleDot,
  FileText,
  Lock,
  Pencil,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  Confidence,
  EvidenceRef,
  InvestigationStatus,
  RootCauseStatus,
  Severity,
} from "@/types/domain";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "ai" | "primary";

export function Badge({ tone = "neutral", icon, children, title }: { tone?: Tone; icon?: ReactNode; children: ReactNode; title?: string }) {
  return (
    <span className={`badge badge--${tone}`} title={title}>
      {icon}
      {children}
    </span>
  );
}

/** Shown on any AI-filled value; removed once a user edits it. */
export function AiSuggestedTag() {
  return (
    <Badge tone="ai" icon={<Sparkles aria-hidden />}>
      AI suggested
    </Badge>
  );
}

export function EditedMarker() {
  return (
    <Badge tone="primary" icon={<Pencil aria-hidden />}>
      Edited
    </Badge>
  );
}

const STATUS: Record<InvestigationStatus, { tone: Tone; label: string; icon: ReactNode }> = {
  draft: { tone: "neutral", label: "Draft", icon: <Circle aria-hidden /> },
  in_review: { tone: "info", label: "In review", icon: <CircleDot aria-hidden /> },
  approved: { tone: "success", label: "Approved", icon: <CheckCircle2 aria-hidden /> },
  closed: { tone: "neutral", label: "Closed", icon: <Lock aria-hidden /> },
};

export function StatusBadge({ status }: { status: InvestigationStatus }) {
  const s = STATUS[status];
  return <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>;
}

const SEVERITY: Record<Severity, Tone> = { critical: "danger", major: "warning", minor: "neutral" };

export function SeverityBadge({ severity }: { severity: Severity | null | undefined }) {
  if (!severity) return <span className="muted small">Not set</span>;
  return (
    <Badge tone={SEVERITY[severity]} icon={<ShieldAlert aria-hidden />}>
      {severity[0].toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

const CONFIDENCE: Record<Confidence, Tone> = { high: "success", medium: "warning", low: "danger" };

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <Badge tone={CONFIDENCE[level]} title="AI confidence in this cause">
      {level[0].toUpperCase() + level.slice(1)} confidence
    </Badge>
  );
}

const CAUSE_STATUS: Record<RootCauseStatus, { tone: Tone; label: string; icon: ReactNode }> = {
  suggested: { tone: "ai", label: "Suggested", icon: <Sparkles aria-hidden /> },
  confirmed: { tone: "success", label: "Confirmed", icon: <CheckCircle2 aria-hidden /> },
  rejected: { tone: "neutral", label: "Rejected", icon: <Ban aria-hidden /> },
};

export function CauseStatusBadge({ status }: { status: RootCauseStatus }) {
  const s = CAUSE_STATUS[status];
  return <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>;
}

export function EvidenceCount({ refs }: { refs: EvidenceRef[] }) {
  const supporting = refs.filter((r) => r.supports).length;
  if (supporting === 0) {
    return (
      <Badge tone="warning" icon={<AlertTriangle aria-hidden />}>
        No supporting evidence
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" icon={<FileText aria-hidden />}>
      {supporting} evidence
    </Badge>
  );
}
