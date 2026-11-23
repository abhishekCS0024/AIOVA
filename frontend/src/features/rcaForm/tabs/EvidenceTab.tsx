import { ChevronRight, FileText, Highlighter, Mail, Type } from "lucide-react";
import { Fragment, useMemo } from "react";

import { Badge } from "@/components/ui/badges";
import EmptyState from "@/components/ui/EmptyState";
import type { WorkspaceProps } from "@/features/workspace";
import type { EvidenceRef } from "@/types/domain";
import type { InvestigationDetail } from "@/types/investigation";

const DOC_ICON = { pdf: FileText, email: Mail, text: Type };

/** Every quote the AI cited, grouped by document name. */
function quotesByDocument(inv: InvestigationDetail): Map<string, Set<string>> {
  const refs: EvidenceRef[] = [
    ...inv.root_causes.flatMap((rc) => rc.evidence_refs),
    ...inv.five_whys.flatMap((w) => w.evidence_refs ?? []),
    ...Object.values(inv.fishbone).flatMap((items) => (items ?? []).flatMap((c) => c.evidence_refs ?? [])),
  ];
  const map = new Map<string, Set<string>>();
  for (const r of refs) {
    if (!r.quote?.trim()) continue;
    if (!map.has(r.document)) map.set(r.document, new Set());
    map.get(r.document)!.add(r.quote.trim());
  }
  return map;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");

/** Wrap cited passages in <mark>; whitespace-insensitive so PDF line breaks still match. */
function Highlighted({ text, quotes }: { text: string; quotes: string[] }) {
  if (!quotes.length) return <>{text}</>;
  const pattern = new RegExp(`(${quotes.sort((a, b) => b.length - a.length).map(escape).join("|")})`, "g");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export default function EvidenceTab({ investigation }: WorkspaceProps) {
  const quotes = useMemo(() => quotesByDocument(investigation), [investigation]);

  if (!investigation.documents.length) {
    return (
      <EmptyState icon={<FileText size={22} />} title="No documents yet">
        Upload a PDF, attach an email or paste text in the AI panel.
      </EmptyState>
    );
  }

  return (
    <div className="stack">
      <p className="small muted row">
        <Highlighter size={16} aria-hidden /> Highlighted passages are the evidence the AI quoted.
      </p>
      {investigation.documents.map((d, i) => {
        const name = d.filename ?? "Pasted text";
        const docQuotes = [...(quotes.get(name) ?? [])];
        const Icon = DOC_ICON[d.type];
        return (
          <details key={d.id} className="card doc-card" open={i === 0}>
            <summary>
              <ChevronRight size={18} className="chev" aria-hidden />
              <Icon size={18} aria-hidden />
              <span style={{ fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
              <Badge tone="neutral">{d.type.toUpperCase()}</Badge>
              {docQuotes.length > 0 && <Badge tone="ai">{docQuotes.length} cited</Badge>}
            </summary>
            <pre className="doc-text">
              {d.extracted_text ? <Highlighted text={d.extracted_text} quotes={docQuotes} /> : "No text could be extracted from this document."}
            </pre>
          </details>
        );
      })}
    </div>
  );
}
