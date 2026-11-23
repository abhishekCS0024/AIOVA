import { ClipboardCheck, FileSearch, GitBranch, ListChecks, ShieldCheck, Target } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Tabs, { type TabDef } from "@/components/ui/Tabs";
import AnalysisTab from "@/features/rcaForm/tabs/AnalysisTab";
import CapaTab from "@/features/rcaForm/tabs/CapaTab";
import DetailsTab from "@/features/rcaForm/tabs/DetailsTab";
import EvidenceTab from "@/features/rcaForm/tabs/EvidenceTab";
import ReviewTab from "@/features/rcaForm/tabs/ReviewTab";
import RootCausesTab from "@/features/rcaForm/tabs/RootCausesTab";
import type { WorkspaceProps } from "@/features/workspace";

type TabKey = "details" | "evidence" | "analysis" | "causes" | "capa" | "review";

const PANELS: Record<TabKey, (p: WorkspaceProps) => JSX.Element> = {
  details: DetailsTab,
  evidence: EvidenceTab,
  analysis: AnalysisTab,
  causes: RootCausesTab,
  capa: CapaTab,
  review: ReviewTab,
};

export default function RcaForm(props: WorkspaceProps) {
  const { investigation: inv } = props;
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const active: TabKey = raw && raw in PANELS ? (raw as TabKey) : "details";

  const tabs: TabDef<TabKey>[] = [
    {
      key: "details", label: "Details", icon: <ClipboardCheck aria-hidden />,
      count: inv.missing_evidence.length || undefined, countTone: "warn",
    },
    { key: "evidence", label: "Evidence", icon: <FileSearch aria-hidden />, count: inv.documents.length },
    { key: "analysis", label: "Analysis", icon: <GitBranch aria-hidden /> },
    { key: "causes", label: "Root causes", icon: <Target aria-hidden />, count: inv.root_causes.length },
    { key: "capa", label: "CAPA", icon: <ListChecks aria-hidden />, count: inv.capa_actions.length },
    { key: "review", label: "Review", icon: <ShieldCheck aria-hidden /> },
  ];
  const Panel = PANELS[active];

  return (
    <section className="card" aria-label="RCA form">
      <Tabs
        tabs={tabs}
        active={active}
        idPrefix="rca"
        label="RCA form sections"
        onChange={(key) => setParams(key === "details" ? {} : { tab: key }, { replace: true })}
      />
      <div role="tabpanel" id="rca-panel" aria-labelledby={`rca-tab-${active}`} className="tab-panel" tabIndex={0}>
        <Panel {...props} />
      </div>
    </section>
  );
}
