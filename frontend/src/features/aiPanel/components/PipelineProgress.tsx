import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import { PIPELINE_STEPS } from "@/features/aiPanel/aiPanelSlice";

const LABELS: Record<(typeof PIPELINE_STEPS)[number], string> = {
  ingest: "Read documents",
  extract: "Extract deviation details",
  gaps: "Find missing evidence",
  analyze: "5 Whys and fishbone",
  causes: "Rank root causes",
  capa: "Recommend CAPA",
};

/** The pipeline runs as one request, so steps show as a group: pending, running or done. */
export default function PipelineProgress({ running, done }: { running: boolean; done: boolean }) {
  return (
    <ol className="pipeline">
      {PIPELINE_STEPS.map((step) => {
        const state = running ? "running" : done ? "done" : "pending";
        return (
          <li key={step} className={`is-${state}`}>
            {state === "running" ? (
              <Loader2 className="spinner" aria-hidden />
            ) : state === "done" ? (
              <CheckCircle2 aria-hidden />
            ) : (
              <Circle aria-hidden />
            )}
            {LABELS[step]}
            <span className="sr-only">
              {state === "done" ? "(done)" : state === "running" ? "(in progress)" : "(not started)"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
