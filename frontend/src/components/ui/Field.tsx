import { AlertCircle } from "lucide-react";
import { useId, type ReactNode } from "react";

interface FieldProps {
  label: ReactNode;
  help?: ReactNode;
  error?: string | null;
  className?: string;
  tags?: ReactNode;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}

/** Visible label + helper + inline error, wired with aria attributes. */
export default function Field({ label, help, error, className = "", tags, children }: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {tags}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {help && !error && <span id={helpId} className="field__help">{help}</span>}
      {error && (
        <span id={errorId} className="field__error" role="alert">
          <AlertCircle size={14} aria-hidden /> {error}
        </span>
      )}
    </div>
  );
}
