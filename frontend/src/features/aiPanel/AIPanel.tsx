import { Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { draftReceived } from "@/features/aiDraft/aiDraftSlice";
import { runFailed, runFinished, runStarted } from "@/features/aiPanel/aiPanelSlice";
import DocumentInput from "@/features/aiPanel/components/InputSelector";
import PipelineProgress from "@/features/aiPanel/components/PipelineProgress";
import { hasDraft, type WorkspaceProps } from "@/features/workspace";
import { useRunAnalysisMutation } from "@/services/investigationsApi";
import { errorMessage } from "@/utils/errors";

function useElapsed(startedAt: number | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  if (!startedAt) return null;
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Left-hand panel: add documents, run the AI, follow its progress. */
export default function AIPanel({ investigation, locked }: WorkspaceProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { runningFor, startedAt, error } = useAppSelector((s) => s.aiPanel);
  const [runAnalysis] = useRunAnalysisMutation();
  const running = runningFor === investigation.id;
  const elapsed = useElapsed(running ? startedAt : null);
  const analyzed = hasDraft(investigation);
  const docCount = investigation.documents.length;

  async function analyze() {
    dispatch(runStarted(investigation.id));
    try {
      const result = await runAnalysis(investigation.id).unwrap();
      dispatch(draftReceived(result.draft));
      dispatch(runFinished());
      toast("success", "AI draft ready. Review each suggestion before saving.");
    } catch (e) {
      const message = errorMessage(e);
      dispatch(runFailed(message));
      toast("error", message);
    }
  }

  return (
    <aside className="card" aria-labelledby="ai-panel-title">
      <div className="card__header">
        <span className="ai-panel__icon" aria-hidden><Sparkles size={18} /></span>
        <div>
          <h2 id="ai-panel-title" style={{ fontSize: "var(--text-base)" }}>AI assistant</h2>
          <p className="small muted">Reads your documents and drafts the RCA</p>
        </div>
      </div>

      <div className="card__body stack" style={{ gap: "var(--space-5)" }}>
        {locked ? (
          <Alert tone="info" title="Read only">
            This investigation is {investigation.status}. Documents and AI analysis are locked.
          </Alert>
        ) : null}

        <section className="stack-sm" aria-labelledby="step-docs">
          <h3 id="step-docs" className="row" style={{ fontSize: "var(--text-sm)" }}>
            <span className="step-num" aria-hidden>1</span> Source documents
          </h3>
          <DocumentInput investigation={investigation} locked={locked || running} />
        </section>

        {!locked && <section className="stack-sm" aria-labelledby="step-run">
          <h3 id="step-run" className="row" style={{ fontSize: "var(--text-sm)" }}>
            <span className="step-num" aria-hidden>2</span> Run AI analysis
          </h3>
          <Button
            variant="ai"
            block
            loading={running}
            disabled={locked || docCount === 0}
            onClick={analyze}
            icon={<Sparkles size={16} aria-hidden />}
          >
            {running ? `Analyzing… ${elapsed ?? ""}` : analyzed ? "Re-analyze documents" : "Analyze documents"}
          </Button>
          {!locked && (
            <p className="small muted">
              {docCount === 0
                ? "Add at least one document first."
                : analyzed
                  ? "Re-analysis replaces AI suggestions you have not confirmed. Confirmed causes are kept."
                  : "Takes about 1–2 minutes. Nothing is final until a QA approver signs off."}
            </p>
          )}
          {running && (
            <div className="progress" role="progressbar" aria-label="AI analysis in progress" aria-valuetext={`Running, ${elapsed} elapsed`}>
              <div className="progress__bar" />
            </div>
          )}
          {error && !running && <Alert tone="danger" title="Analysis failed">{error}</Alert>}
        </section>}

        <section className="stack-sm" aria-labelledby="step-progress">
          <h3 id="step-progress" className="section-title">Pipeline</h3>
          <PipelineProgress running={running} done={analyzed} />
        </section>

        {analyzed && !running && !locked && (
          <section className="stack-sm" aria-labelledby="step-review">
            <h3 id="step-review" className="row" style={{ fontSize: "var(--text-sm)" }}>
              <span className="step-num" aria-hidden>3</span> Review the draft
            </h3>
            <p className="small muted">
              Check each tab on the right. Edit fields, confirm or reject causes, adjust CAPA, then submit for review.
            </p>
          </section>
        )}
        {locked && <p className="small muted row"><Lock size={14} aria-hidden /> Changes are recorded in the audit trail.</p>}
      </div>
    </aside>
  );
}
