import {
  Ban, CheckCircle2, Circle, FilePlus2, Pencil, Send, ShieldCheck, Sparkles, UserCheck,
} from "lucide-react";
import type { ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Alert from "@/components/ui/Alert";
import { Badge, EditedMarker } from "@/components/ui/badges";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { approvalCommentChanged } from "@/features/review/reviewSlice";
import type { WorkspaceProps } from "@/features/workspace";
import { userName } from "@/hooks/useCurrentUser";
import {
  useApproveInvestigationMutation,
  useGetAuditTrailQuery,
  useUpdateInvestigationMutation,
} from "@/services/investigationsApi";
import type { AuditEntry, FormData } from "@/types/investigation";
import { errorMessage } from "@/utils/errors";
import { dateTime, relativeTime } from "@/utils/format";

const FIELD_LABELS: Record<keyof FormData, string> = {
  deviation_title: "Deviation title",
  deviation_date: "Date identified",
  product: "Product",
  batch_no: "Batch number",
  equipment_id: "Equipment",
  process_step: "Process step",
  description: "Description",
  immediate_actions: "Immediate actions",
  proposed_severity: "Severity",
};

const ACTIONS: Record<string, { label: string; icon: ReactNode }> = {
  created: { label: "Investigation created", icon: <FilePlus2 aria-hidden /> },
  document_added: { label: "Document added", icon: <FilePlus2 aria-hidden /> },
  ai_draft_generated: { label: "AI draft generated", icon: <Sparkles aria-hidden /> },
  field_edit: { label: "Field edited", icon: <Pencil aria-hidden /> },
  cause_edit: { label: "Cause edited", icon: <Pencil aria-hidden /> },
  cause_confirmed: { label: "Cause confirmed", icon: <CheckCircle2 aria-hidden /> },
  cause_rejected: { label: "Cause rejected", icon: <Ban aria-hidden /> },
  cause_suggested: { label: "Cause reset to suggested", icon: <Circle aria-hidden /> },
  capa_edit: { label: "CAPA updated", icon: <Pencil aria-hidden /> },
  approved: { label: "Investigation approved", icon: <ShieldCheck aria-hidden /> },
};

const show = (v: unknown) =>
  v == null || v === "" ? "—" : typeof v === "string" ? v : JSON.stringify(v);

function AuditTimeline({ investigationId }: { investigationId: string }) {
  const { data, isLoading } = useGetAuditTrailQuery(investigationId);
  if (isLoading) return <div className="stack-sm">{[0, 1, 2].map((i) => <Skeleton key={i} height={28} />)}</div>;
  const entries = [...(data ?? [])].reverse();
  return (
    <ol className="timeline">
      {entries.map((e: AuditEntry) => {
        const a =
          e.action === "field_edit" && e.field === "status"
            ? { label: "Status changed", icon: <Send aria-hidden /> }
            : ACTIONS[e.action] ?? { label: e.action.replace(/_/g, " "), icon: <Circle aria-hidden /> };
        const field = e.field?.replace("form_data.", "");
        return (
          <li key={e.id}>
            <span className={`timeline__icon ${e.source === "ai" ? "timeline__icon--ai" : ""}`}>{a.icon}</span>
            <div>
              <p className="timeline__title">
                {a.label}
                {field && field !== "status" ? <> · <span className="mono">{FIELD_LABELS[field as keyof FormData] ?? field}</span></> : null}
                {e.action === "document_added" && typeof e.new_value === "string" ? <> · {e.new_value}</> : null}
              </p>
              <p className="timeline__meta">
                {e.source === "ai" ? "AI" : userName(e.user_id)} · <time dateTime={e.at} title={dateTime(e.at)}>{relativeTime(e.at)}</time>
              </p>
              {e.action.endsWith("_edit") && (
                <p className="change">{show(e.old_value)} → {show(e.new_value)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Check({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className={ok ? "ok" : "no"}>
      {ok ? <CheckCircle2 aria-hidden /> : <Circle aria-hidden />}
      {children}
      <span className="sr-only">{ok ? "(done)" : "(not done)"}</span>
    </li>
  );
}

export default function ReviewTab({ investigation: inv, isQA }: WorkspaceProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const comment = useAppSelector((s) => s.review.approvalComment);
  const [approve, { isLoading: approving }] = useApproveInvestigationMutation();
  const [update, { isLoading: submitting }] = useUpdateInvestigationMutation();

  const confirmed = inv.root_causes.filter((r) => r.status === "confirmed" && r.type === "root_cause").length;
  const confirmedAny = inv.root_causes.filter((r) => r.status === "confirmed").length;
  const pending = inv.root_causes.filter((r) => r.status === "suggested").length;
  const ready = confirmedAny > 0 && inv.capa_actions.length > 0 && inv.status === "in_review";

  const aiFields = (inv.ai_draft?.extracted_fields ?? {}) as FormData;
  const diffRows = (Object.keys(FIELD_LABELS) as (keyof FormData)[]).map((k) => ({
    key: k,
    ai: aiFields[k] ?? null,
    final: inv.form_data[k] ?? null,
  }));
  const changed = diffRows.filter((r) => r.ai !== r.final).length;

  async function doApprove() {
    try {
      await approve({ id: inv.id, comment: comment || undefined }).unwrap();
      dispatch(approvalCommentChanged(""));
      toast("success", "Investigation approved and locked");
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  async function submit() {
    try {
      await update({ id: inv.id, status: "in_review" }).unwrap();
      toast("success", "Submitted for QA review");
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  return (
    <div className="stack" style={{ gap: "var(--space-8)" }}>
      <section className="stats" aria-label="Summary">
        <div className="stat"><div className="stat__value">{confirmed}</div><div className="stat__label">Confirmed root causes</div></div>
        <div className="stat"><div className="stat__value">{pending}</div><div className="stat__label">Causes awaiting decision</div></div>
        <div className="stat"><div className="stat__value">{inv.capa_actions.length}</div><div className="stat__label">CAPA actions</div></div>
        <div className="stat"><div className="stat__value">{inv.missing_evidence.length}</div><div className="stat__label">Evidence gaps</div></div>
      </section>

      <section className="card" aria-labelledby="approval-title">
        <div className="card__header">
          <UserCheck size={18} aria-hidden />
          <h3 id="approval-title" style={{ fontSize: "var(--text-base)" }}>QA approval</h3>
        </div>
        <div className="card__body stack">
          <ul className="checklist" aria-label="Approval checklist">
            <Check ok={confirmedAny > 0}>At least one cause confirmed by QA, with evidence</Check>
            <Check ok={inv.capa_actions.length > 0}>CAPA actions linked to causes</Check>
            <Check ok={inv.status !== "draft"}>Submitted for review</Check>
          </ul>

          {inv.status === "approved" || inv.status === "closed" ? (
            <Alert tone="success" title={`Investigation ${inv.status}`}>
              The record is locked. CAPA status can still be updated as actions are carried out.
            </Alert>
          ) : inv.status === "draft" ? (
            <div className="row">
              <Button variant="primary" loading={submitting} icon={<Send size={16} aria-hidden />} onClick={submit}>
                Submit for review
              </Button>
              <span className="small muted">QA reviews and signs off once submitted.</span>
            </div>
          ) : isQA ? (
            <>
              <Field label="Approval comment" help="Optional. Saved with your approval in the audit trail.">
                {(p) => (
                  <textarea {...p} className="textarea" rows={3} value={comment}
                    onChange={(e) => dispatch(approvalCommentChanged(e.target.value))} />
                )}
              </Field>
              <div className="row">
                <Button variant="primary" disabled={!ready} loading={approving} icon={<ShieldCheck size={16} aria-hidden />} onClick={doApprove}>
                  Approve investigation
                </Button>
                {!ready && <span className="small muted">Complete the checklist above to approve.</span>}
              </div>
            </>
          ) : (
            <Alert tone="info" title="Waiting for QA approval">
              A QA approver needs to confirm the causes and approve this investigation.
            </Alert>
          )}
        </div>
      </section>

      <section className="stack" aria-labelledby="diff-title">
        <div>
          <div className="row"><h3 id="diff-title">AI draft vs. final</h3>{changed > 0 && <Badge tone="primary">{changed} changed</Badge>}</div>
          <p className="small muted">The original AI output is kept unchanged, so every human edit can be reviewed.</p>
        </div>
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr><th scope="col">Field</th><th scope="col">AI draft</th><th scope="col">Final</th></tr>
            </thead>
            <tbody>
              {diffRows.map((r) => (
                <tr key={r.key} className={r.ai !== r.final ? "diff-changed" : undefined}>
                  <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{FIELD_LABELS[r.key]}</td>
                  <td className="muted" style={{ whiteSpace: "pre-line" }}>{show(r.ai)}</td>
                  <td style={{ whiteSpace: "pre-line" }}>
                    {show(r.final)} {r.ai !== r.final && <EditedMarker />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="stack" aria-labelledby="audit-title">
        <div>
          <h3 id="audit-title">Audit trail</h3>
          <p className="small muted">Every change, newest first: who, what, when, and whether it came from the AI or a person.</p>
        </div>
        <AuditTimeline investigationId={inv.id} />
      </section>
    </div>
  );
}
