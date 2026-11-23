import { ListChecks, ShieldCheck, Wrench } from "lucide-react";
import { useState } from "react";

import { Badge, CauseStatusBadge } from "@/components/ui/badges";
import EmptyState from "@/components/ui/EmptyState";
import Field from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { WorkspaceProps } from "@/features/workspace";
import { useUpdateCapaMutation } from "@/services/investigationsApi";
import type { CapaStatus } from "@/types/domain";
import type { CapaAction } from "@/types/investigation";
import { errorMessage } from "@/utils/errors";

// Mirrors backend CAPA_TRANSITIONS.
const NEXT: Record<CapaStatus, CapaStatus[]> = {
  proposed: ["accepted"],
  accepted: ["in_progress", "proposed"],
  in_progress: ["completed"],
  completed: ["verified"],
  verified: [],
};
const LABEL: Record<CapaStatus, string> = {
  proposed: "Proposed", accepted: "Accepted", in_progress: "In progress", completed: "Completed", verified: "Verified",
};

function CapaRow({ action, investigationId, locked }: { action: CapaAction; investigationId: string; locked: boolean }) {
  const [update, { isLoading }] = useUpdateCapaMutation();
  const toast = useToast();
  const [owner, setOwner] = useState(action.owner ?? "");
  const [due, setDue] = useState(action.due_date ?? "");

  async function save(patch: Partial<CapaAction>, message: string) {
    try {
      await update({ id: action.id, investigationId, ...patch }).unwrap();
      toast("success", message);
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  const corrective = action.type === "corrective";
  return (
    <div className="capa-item">
      <div className="stack-sm">
        <div className="row">
          <Badge tone={corrective ? "info" : "primary"} icon={corrective ? <Wrench aria-hidden /> : <ShieldCheck aria-hidden />}>
            {corrective ? "Corrective" : "Preventive"}
          </Badge>
        </div>
        <p style={{ fontWeight: 500 }}>{action.action}</p>
        {action.rationale && <p className="small muted"><strong>Why:</strong> {action.rationale}</p>}
        {action.effectiveness_check && <p className="small muted"><strong>Effectiveness check:</strong> {action.effectiveness_check}</p>}
      </div>
      <div className="capa-item__side">
        <Field label="Owner">
          {(p) => (
            <input {...p} className="input" value={owner} readOnly={locked}
              onChange={(e) => setOwner(e.target.value)}
              onBlur={() => owner !== (action.owner ?? "") && save({ owner }, "Owner updated")} />
          )}
        </Field>
        <Field label="Due date">
          {(p) => (
            <input {...p} type="date" className="input" value={due} readOnly={locked}
              onChange={(e) => setDue(e.target.value)}
              onBlur={() => due !== (action.due_date ?? "") && save({ due_date: due || null }, "Due date updated")} />
          )}
        </Field>
        <Field label="Status" help={locked ? "Status can still be tracked after approval." : undefined}>
          {(p) => (
            <select {...p} className="select" value={action.status} disabled={isLoading || NEXT[action.status].length === 0}
              onChange={(e) => save({ status: e.target.value as CapaStatus }, `Status set to ${LABEL[e.target.value as CapaStatus]}`)}>
              <option value={action.status}>{LABEL[action.status]}</option>
              {NEXT[action.status].map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
            </select>
          )}
        </Field>
      </div>
    </div>
  );
}

export default function CapaTab({ investigation, locked }: WorkspaceProps) {
  if (!investigation.capa_actions.length) {
    return (
      <EmptyState icon={<ListChecks size={22} />} title="No CAPA yet">
        Run the AI analysis to get corrective and preventive actions for each cause.
      </EmptyState>
    );
  }

  return (
    <div className="stack" style={{ gap: "var(--space-6)" }}>
      <p className="small muted">
        Every action is linked to the cause it addresses. Corrective actions fix what happened; preventive actions stop it recurring.
      </p>
      {investigation.root_causes.map((rc) => {
        const actions = investigation.capa_actions
          .filter((a) => a.root_cause_id === rc.id)
          .sort((a, b) => (a.type === b.type ? 0 : a.type === "corrective" ? -1 : 1));
        if (!actions.length) return null;
        return (
          <section key={rc.id} className="capa-group" aria-label={`Actions for: ${rc.description}`}>
            <div className="capa-group__head">
              <Badge tone="neutral">{rc.type === "root_cause" ? "Root cause" : "Contributing factor"}</Badge>
              <CauseStatusBadge status={rc.status} />
              <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", flex: "1 1 300px" }}>{rc.description}</span>
            </div>
            {actions.map((a) => <CapaRow key={a.id} action={a} investigationId={investigation.id} locked={locked} />)}
          </section>
        );
      })}
    </div>
  );
}
