import { ArrowLeft, CheckCircle2, Lock, RotateCcw, Send } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import Alert from "@/components/ui/Alert";
import { SeverityBadge, StatusBadge } from "@/components/ui/badges";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stepper from "@/components/ui/Stepper";
import { useToast } from "@/components/ui/Toast";
import AIPanel from "@/features/aiPanel/AIPanel";
import { loaded } from "@/features/investigation/investigationSlice";
import RcaForm from "@/features/rcaForm/RcaForm";
import { hasDraft, isLocked, type WorkspaceProps } from "@/features/workspace";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetInvestigationQuery, useUpdateInvestigationMutation } from "@/services/investigationsApi";
import type { InvestigationStatus } from "@/types/domain";
import { errorMessage } from "@/utils/errors";

const WORKFLOW = [
  { key: "draft", label: "Draft" },
  { key: "in_review", label: "In review" },
  { key: "approved", label: "Approved" },
  { key: "closed", label: "Closed" },
];

function HeaderActions({ investigation, isQA }: WorkspaceProps) {
  const [update, { isLoading }] = useUpdateInvestigationMutation();
  const [, setParams] = useSearchParams();
  const toast = useToast();

  async function move(status: InvestigationStatus, message: string) {
    try {
      await update({ id: investigation.id, status }).unwrap();
      toast("success", message);
    } catch (e) {
      toast("error", errorMessage(e));
    }
  }

  switch (investigation.status) {
    case "draft":
      return (
        <Button variant="primary" loading={isLoading} icon={<Send size={16} aria-hidden />}
          onClick={() => move("in_review", "Submitted for QA review")}>
          Submit for review
        </Button>
      );
    case "in_review":
      return (
        <div className="row">
          <Button variant="secondary" loading={isLoading} icon={<RotateCcw size={16} aria-hidden />}
            onClick={() => move("draft", "Returned to draft")}>
            Return to draft
          </Button>
          {isQA && (
            <Button variant="primary" icon={<CheckCircle2 size={16} aria-hidden />}
              onClick={() => setParams({ tab: "review" })}>
              Review and approve
            </Button>
          )}
        </div>
      );
    case "approved":
      return isQA ? (
        <Button variant="secondary" loading={isLoading} icon={<Lock size={16} aria-hidden />}
          onClick={() => move("closed", "Investigation closed")}>
          Close investigation
        </Button>
      ) : null;
    default:
      return null;
  }
}

function WorkspaceSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading investigation">
      <Skeleton width={180} height={14} />
      <Skeleton width={420} height={32} />
      <div className="workspace">
        <Skeleton height={420} />
        <Skeleton height={420} />
      </div>
    </div>
  );
}

/** AI panel beside the RCA form, so the user sees the AI fill the form (docs §10.1). */
export default function InvestigationWorkspacePage() {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const { data, isLoading, error, refetch } = useGetInvestigationQuery(id);

  useEffect(() => {
    if (data) dispatch(loaded({ id: data.id, status: data.status, formData: data.form_data }));
  }, [data, dispatch]);

  useEffect(() => {
    if (data) document.title = `${data.deviation_no} · RCA Workbench`;
    return () => {
      document.title = "RCA Workbench";
    };
  }, [data]);

  if (isLoading) return <WorkspaceSkeleton />;
  if (error || !data) {
    return (
      <Alert tone="danger" title="Could not load this investigation"
        action={<Button size="sm" onClick={refetch}>Retry</Button>}>
        {errorMessage(error)} <Link to="/">Back to investigations</Link>
      </Alert>
    );
  }

  const props: WorkspaceProps = { investigation: data, locked: isLocked(data), isQA: user.isQA };

  return (
    <>
      <div className="ws-header">
        <Link to="/" className="breadcrumb">
          <ArrowLeft size={16} aria-hidden /> All investigations
        </Link>
        <div className="ws-header__top">
          <div className="ws-header__title">
            <span className="ws-header__dev">{data.deviation_no}</span>
            <h1>{data.form_data.deviation_title || data.title || "Untitled investigation"}</h1>
            <div className="row">
              <StatusBadge status={data.status} />
              <SeverityBadge severity={data.severity} />
              <span className="small muted">Version {data.version}</span>
            </div>
          </div>
          <HeaderActions {...props} />
        </div>
        <Stepper steps={WORKFLOW} current={data.status} label="Investigation workflow" />
      </div>

      <div className={`workspace ${hasDraft(data) ? "workspace--analyzed" : ""}`}>
        <div className="workspace__aside">
          <AIPanel {...props} />
        </div>
        <RcaForm {...props} />
      </div>
    </>
  );
}
