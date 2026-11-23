import { Ban, CheckCircle2, FileText, Info, RotateCcw, Target } from "lucide-react";

import {
  CauseStatusBadge,
  ConfidenceBadge,
  EvidenceCount,
  Badge,
} from "@/components/ui/badges";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { WorkspaceProps } from "@/features/workspace";
import { userName } from "@/hooks/useCurrentUser";
import { useUpdateRootCauseMutation } from "@/services/investigationsApi";
import type { RootCauseStatus } from "@/types/domain";
import type { RootCause } from "@/types/investigation";
import { errorMessage } from "@/utils/errors";

function CauseCard({ rc, investigationId, locked, isQA }: { rc: RootCause; investigationId: string; locked: boolean; isQA: boolean }) {
  const [update, { isLoading, originalArgs }] = useUpdateRootCauseMutation();
  const toast = useToast();
  const supported = rc.evidence_refs.some((r) => r.supports);
  const pending = (s: RootCauseStatus) => isLoading && originalArgs?.status === s;

  async function setStatus(status: RootCauseStatus, message: string) {
    try {
      await update({ id: rc.id, investigationId, status }).unwrap();
      toast("success", message);
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  return (
    <article className={`cause cause--${rc.status}`} aria-label={`${rc.type === "root_cause" ? "Root cause" : "Contributing factor"}: ${rc.description}`}>
      <div className="cause__meta">
        <CauseStatusBadge status={rc.status} />
        <Badge tone="neutral">{rc.category}</Badge>
        <ConfidenceBadge level={rc.confidence} />
        <EvidenceCount refs={rc.evidence_refs} />
      </div>
      <div className="cause__body">
        <p className="cause__desc">{rc.description}</p>
        {rc.evidence_refs.map((ref, i) => (
          <blockquote key={i} className={`quote ${ref.supports ? "quote--support" : "quote--weak"}`}>
            “{ref.quote}”
            <cite>
              <FileText aria-hidden /> {ref.document}
              {!ref.supports && " · related, but does not directly support this cause"}
            </cite>
          </blockquote>
        ))}
        {rc.missing_evidence.length > 0 && (
          <div className="small">
            <span className="muted">Evidence still needed: </span>
            {rc.missing_evidence.join("; ")}
          </div>
        )}
      </div>

      {!locked && (
        <div className="cause__actions">
          {rc.status === "suggested" && (
            <>
              {isQA ? (
                <Button
                  variant="primary" size="sm"
                  disabled={!supported}
                  loading={pending("confirmed")}
                  icon={<CheckCircle2 size={16} aria-hidden />}
                  onClick={() => setStatus("confirmed", "Cause confirmed")}
                  aria-describedby={!supported ? `need-${rc.id}` : undefined}
                >
                  Confirm
                </Button>
              ) : null}
              <Button variant="danger-ghost" size="sm" loading={pending("rejected")} icon={<Ban size={16} aria-hidden />}
                onClick={() => setStatus("rejected", "Cause rejected")}>
                Reject
              </Button>
              <span id={`need-${rc.id}`} className="small muted row" style={{ gap: 4 }}>
                <Info size={14} aria-hidden />
                {!isQA
                  ? "Only a QA approver can confirm causes."
                  : !supported
                    ? "Needs at least one supporting quote before it can be confirmed."
                    : "Confirm once you agree with the evidence."}
              </span>
            </>
          )}
          {rc.status === "confirmed" && (
            <>
              <span className="small row" style={{ gap: 4, color: "var(--color-success)" }}>
                <CheckCircle2 size={16} aria-hidden /> Confirmed by {userName(rc.confirmed_by)}
              </span>
              {isQA && (
                <Button variant="ghost" size="sm" loading={pending("suggested")} icon={<RotateCcw size={16} aria-hidden />}
                  onClick={() => setStatus("suggested", "Confirmation undone")}>
                  Undo
                </Button>
              )}
            </>
          )}
          {rc.status === "rejected" && (
            <Button variant="ghost" size="sm" loading={pending("suggested")} icon={<RotateCcw size={16} aria-hidden />}
              onClick={() => setStatus("suggested", "Cause restored")}>
              Restore
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

export default function RootCausesTab({ investigation, locked, isQA }: WorkspaceProps) {
  const causes = investigation.root_causes;
  if (!causes.length) {
    return (
      <EmptyState icon={<Target size={22} />} title="No causes yet">
        Run the AI analysis to get ranked root causes and contributing factors.
      </EmptyState>
    );
  }

  const groups = [
    { title: "Root causes", help: "The fundamental reason. Fixing it prevents recurrence.", items: causes.filter((c) => c.type === "root_cause") },
    { title: "Contributing factors", help: "Conditions that made the deviation more likely or worse.", items: causes.filter((c) => c.type === "contributing_factor") },
  ];

  return (
    <div className="stack" style={{ gap: "var(--space-8)" }}>
      <p className="small muted">
        AI causes are suggestions. A QA approver confirms a cause only when it has supporting evidence.
      </p>
      {groups.map((g) => (
        <section key={g.title} className="stack" aria-label={g.title}>
          <div>
            <div className="row"><h3>{g.title}</h3><Badge tone="neutral">{g.items.length}</Badge></div>
            <p className="small muted">{g.help}</p>
          </div>
          {g.items.length ? (
            g.items.map((rc) => (
              <CauseCard key={rc.id} rc={rc} investigationId={investigation.id} locked={locked} isQA={isQA} />
            ))
          ) : (
            <p className="small muted">None identified.</p>
          )}
        </section>
      ))}
    </div>
  );
}
