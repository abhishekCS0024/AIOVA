import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";

const ICONS = { info: Info, warning: AlertTriangle, danger: XCircle, success: CheckCircle2 };

export default function Alert({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: keyof typeof ICONS;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const Icon = ICONS[tone];
  return (
    <div className={`alert alert--${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon aria-hidden />
      <div className="stack-sm" style={{ flex: 1, gap: 2 }}>
        {title && <span className="alert__title">{title}</span>}
        {children && <span>{children}</span>}
      </div>
      {action}
    </div>
  );
}
