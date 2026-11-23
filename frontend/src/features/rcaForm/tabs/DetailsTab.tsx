import { AlertTriangle, Info, Save, Undo2 } from "lucide-react";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Alert from "@/components/ui/Alert";
import { AiSuggestedTag, Badge, EditedMarker } from "@/components/ui/badges";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { discarded, fieldEdited, saved } from "@/features/investigation/investigationSlice";
import { hasDraft, type WorkspaceProps } from "@/features/workspace";
import { useUpdateInvestigationMutation } from "@/services/investigationsApi";
import type { Severity } from "@/types/domain";
import type { FormData, Gap } from "@/types/investigation";
import { errorMessage } from "@/utils/errors";
import { fieldStatus } from "@/utils/fieldStatus";

type FieldDef = { key: keyof FormData; label: string; kind?: "textarea" | "severity"; span?: boolean; mono?: boolean; help?: string };

const FIELDS: FieldDef[] = [
  { key: "deviation_title", label: "Deviation title", span: true },
  { key: "deviation_date", label: "Date identified" },
  { key: "product", label: "Product" },
  { key: "batch_no", label: "Batch number", mono: true },
  { key: "equipment_id", label: "Equipment", mono: true },
  { key: "process_step", label: "Process step" },
  { key: "proposed_severity", label: "Severity", kind: "severity", help: "Critical: likely patient/quality impact · Major: possible impact · Minor: no expected impact" },
  { key: "description", label: "Description", kind: "textarea", span: true },
  { key: "immediate_actions", label: "Immediate actions", kind: "textarea", span: true },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;
const PRIORITY_TONE = { high: "danger", medium: "warning", low: "neutral" } as const;

function MissingEvidence({ gaps }: { gaps: Gap[] }) {
  if (!gaps.length) return null;
  const sorted = [...gaps].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  return (
    <section className="stack-sm" aria-labelledby="gaps-title" style={{ marginTop: "var(--space-8)" }}>
      <div className="row">
        <h3 id="gaps-title">Missing evidence</h3>
        <Badge tone="warning">{gaps.length}</Badge>
      </div>
      <p className="small muted">The AI found these gaps. Add the evidence in the AI panel and re-analyze.</p>
      <ul className="gap-list">
        {sorted.map((g) => (
          <li key={g.item} className="gap-item">
            <AlertTriangle aria-hidden />
            <span className="gap-item__title">
              {g.item}
              <Badge tone={PRIORITY_TONE[g.priority]}>{g.priority} priority</Badge>
            </span>
            <span className="gap-item__why">{g.why_it_matters}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DetailsTab({ investigation, locked }: WorkspaceProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { formData, editedFields, dirty } = useAppSelector((s) => s.investigation);
  const [update, { isLoading }] = useUpdateInvestigationMutation();
  const aiFields = investigation.ai_draft?.extracted_fields as FormData | undefined;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    try {
      await update({
        id: investigation.id,
        form_data: formData,
        severity: (formData.proposed_severity ?? null) as Severity | null,
      }).unwrap();
      dispatch(saved());
      toast("success", "Changes saved and recorded in the audit trail");
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  return (
    <div>
      {!hasDraft(investigation) && !locked && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert tone="info" title="Let the AI fill this in">
            Add the incident documents in the AI panel and run the analysis. You can also type values yourself.
          </Alert>
        </div>
      )}

      <div className="form-grid">
        {FIELDS.map(({ key, label, kind, span, mono, help }) => {
          const status = fieldStatus(key, formData, aiFields, editedFields);
          const value = (formData[key] ?? "") as string;
          const onChange = (v: string) => dispatch(fieldEdited({ field: key, value: v || null }));
          const tags = status === "ai" ? <AiSuggestedTag /> : status === "edited" ? <EditedMarker /> : null;
          return (
            <Field
              key={key}
              label={label}
              tags={tags}
              help={help}
              className={`${span ? "span-2" : ""} ${status === "ai" ? "field--ai" : ""}`}
            >
              {(p) =>
                kind === "textarea" ? (
                  <textarea {...p} className="textarea" rows={4} value={value} readOnly={locked} onChange={(e) => onChange(e.target.value)} />
                ) : kind === "severity" ? (
                  <select {...p} className="select" value={value} disabled={locked} onChange={(e) => onChange(e.target.value)}>
                    <option value="">Not set</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                ) : (
                  <input {...p} className={`input ${mono ? "mono" : ""}`} value={value} readOnly={locked} onChange={(e) => onChange(e.target.value)} />
                )
              }
            </Field>
          );
        })}
      </div>

      {dirty && !locked && (
        <div className="save-bar" role="region" aria-label="Unsaved changes">
          <Info size={18} aria-hidden style={{ color: "var(--color-primary)" }} />
          <span className="small" style={{ flex: 1 }}>
            You have unsaved changes to {editedFields.length} field{editedFields.length === 1 ? "" : "s"}.
          </span>
          <Button variant="ghost" icon={<Undo2 size={16} aria-hidden />} onClick={() => dispatch(discarded())}>
            Discard
          </Button>
          <Button variant="primary" loading={isLoading} icon={<Save size={16} aria-hidden />} onClick={save}>
            Save changes
          </Button>
        </div>
      )}

      <MissingEvidence gaps={investigation.missing_evidence} />
    </div>
  );
}
