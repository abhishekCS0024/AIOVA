import { AlertTriangle, FileText, Mail, Type, UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badges";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { modeChanged, pastedTextChanged, type InputMode } from "@/features/aiPanel/aiPanelSlice";
import { useSubmitPastedTextMutation, useUploadDocumentMutation } from "@/services/investigationsApi";
import type { InvestigationDetail } from "@/types/investigation";
import { errorMessage } from "@/utils/errors";

const MODES: { mode: InputMode; label: string; icon: typeof FileText; accept?: string; hint?: string }[] = [
  { mode: "pdf", label: "PDF", icon: FileText, accept: "application/pdf,.pdf", hint: "PDF with a text layer, up to 20 MB" },
  { mode: "text", label: "Text", icon: Type },
  { mode: "email", label: "Email", icon: Mail, accept: ".eml,message/rfc822", hint: "Saved email (.eml), with PDF attachments" },
];

const DOC_ICON = { pdf: FileText, email: Mail, text: Type };

export default function DocumentInput({ investigation, locked }: { investigation: InvestigationDetail; locked: boolean }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { mode, pastedText } = useAppSelector((s) => s.aiPanel);
  const [upload, { isLoading: uploading }] = useUploadDocumentMutation();
  const [submitText, { isLoading: submitting }] = useSubmitPastedTextMutation();
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const current = MODES.find((m) => m.mode === mode)!;

  async function uploadFiles(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      try {
        await upload({ id: investigation.id, file }).unwrap();
        toast("success", `Added ${file.name}`);
      } catch (e) {
        toast("error", `${file.name}: ${errorMessage(e)}`);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  async function addText() {
    try {
      await submitText({ id: investigation.id, text: pastedText }).unwrap();
      dispatch(pastedTextChanged(""));
      toast("success", "Text added as a source document");
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!locked) uploadFiles(e.dataTransfer.files);
  }

  return (
    <div className="stack-sm">
      {!locked && (
        <>
          <div className="segmented" role="radiogroup" aria-label="Document type">
            {MODES.map((m) => (
              <button
                key={m.mode}
                role="radio"
                aria-checked={m.mode === mode}
                onClick={() => dispatch(modeChanged(m.mode))}
              >
                <m.icon aria-hidden /> {m.label}
              </button>
            ))}
          </div>

          {mode === "text" ? (
            <>
              <Field label="Incident text" help="Paste a description, shift notes or any other evidence.">
                {(p) => (
                  <textarea
                    {...p}
                    className="textarea"
                    rows={6}
                    value={pastedText}
                    onChange={(e) => dispatch(pastedTextChanged(e.target.value))}
                  />
                )}
              </Field>
              <Button variant="secondary" disabled={!pastedText.trim()} loading={submitting} onClick={addText}>
                Add text
              </Button>
            </>
          ) : (
            <label
              className={`dropzone ${dragging ? "dropzone--active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <UploadCloud aria-hidden />
              <span>
                <strong style={{ color: "var(--color-primary)" }}>{uploading ? "Uploading…" : "Choose a file"}</strong> or drag it here
              </span>
              <span className="small muted">{current.hint}</span>
              <input
                ref={fileInput}
                type="file"
                className="sr-only"
                aria-label={`Upload ${current.label} file`}
                accept={current.accept}
                multiple
                disabled={uploading}
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </label>
          )}
        </>
      )}

      {investigation.documents.length > 0 ? (
        <ul className="doc-list" aria-label="Added documents">
          {investigation.documents.map((d) => {
            const Icon = DOC_ICON[d.type];
            const empty = !d.extracted_text.trim();
            return (
              <li key={d.id} className="doc-item">
                <Icon aria-hidden />
                <span className="doc-item__name" title={d.filename ?? "Pasted text"}>{d.filename ?? "Pasted text"}</span>
                {empty ? (
                  <Badge tone="warning" icon={<AlertTriangle aria-hidden />} title="No text layer found. Paste the content as text instead.">
                    No text
                  </Badge>
                ) : (
                  <span className="small muted">{d.extracted_text.length.toLocaleString()} chars</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="small muted">No documents yet.</p>
      )}
    </div>
  );
}
