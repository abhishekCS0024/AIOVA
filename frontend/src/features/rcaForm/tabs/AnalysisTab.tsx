import { CloudSun, Cog, FileText, GitBranch, Gauge, ListOrdered, Package, Users } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import type { WorkspaceProps } from "@/features/workspace";
import type { EvidenceRef, FishboneCategory } from "@/types/domain";

const BONES: { key: FishboneCategory; label: string; icon: typeof Users }[] = [
  { key: "Man", label: "Man (people)", icon: Users },
  { key: "Machine", label: "Machine", icon: Cog },
  { key: "Method", label: "Method", icon: ListOrdered },
  { key: "Material", label: "Material", icon: Package },
  { key: "Measurement", label: "Measurement", icon: Gauge },
  { key: "Mother Nature", label: "Mother Nature", icon: CloudSun },
];

function Sources({ refs }: { refs: EvidenceRef[] }) {
  const docs = [...new Set(refs.filter((r) => r.supports).map((r) => r.document))];
  if (!docs.length) return null;
  return (
    <p className="small muted row" style={{ marginTop: 4, gap: 6 }}>
      <FileText size={12} aria-hidden /> {docs.join(", ")}
    </p>
  );
}

export default function AnalysisTab({ investigation }: WorkspaceProps) {
  const { five_whys: whys, fishbone } = investigation;

  if (!whys.length) {
    return (
      <EmptyState icon={<GitBranch size={22} />} title="No analysis yet">
        Run the AI analysis to generate a 5 Whys chain and a 6M fishbone.
      </EmptyState>
    );
  }

  return (
    <div className="stack" style={{ gap: "var(--space-8)" }}>
      <section aria-labelledby="whys-title" className="stack">
        <div>
          <h3 id="whys-title">5 Whys</h3>
          <p className="small muted">Each answer leads to the next question, ending at the underlying cause.</p>
        </div>
        <ol className="whys">
          {whys.map((w) => (
            <li key={w.level}>
              <span className="whys__num" aria-hidden>{w.level}</span>
              <div>
                <p className="whys__q">{w.question}</p>
                <p className="whys__a">{w.answer}</p>
                <Sources refs={w.evidence_refs ?? []} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="fish-title" className="stack">
        <div>
          <h3 id="fish-title">Fishbone (6M)</h3>
          <p className="small muted">Possible causes grouped into the six Ishikawa categories.</p>
        </div>
        <div className="fishbone">
          {BONES.map(({ key, label, icon: Icon }) => {
            const items = fishbone[key] ?? [];
            return (
              <section key={key} className={`bone ${items.length ? "" : "bone--empty"}`} aria-label={`${label}: ${items.length} causes`}>
                <div className="bone__head">
                  <Icon aria-hidden /> {label}
                  <span className="spacer" />
                  <span className="badge badge--neutral">{items.length}</span>
                </div>
                {items.length ? (
                  <ul>
                    {items.map((c, i) => <li key={i}>{c.description}</li>)}
                  </ul>
                ) : (
                  <p className="small muted">No causes identified.</p>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
