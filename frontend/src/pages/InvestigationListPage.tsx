import { FilePlus2, FolderSearch, Plus, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import Alert from "@/components/ui/Alert";
import { SeverityBadge, StatusBadge } from "@/components/ui/badges";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Field from "@/components/ui/Field";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import {
  useCreateInvestigationMutation,
  useListInvestigationsQuery,
} from "@/services/investigationsApi";
import type { InvestigationStatus } from "@/types/domain";
import { errorMessage } from "@/utils/errors";
import { dateTime, relativeTime } from "@/utils/format";

const STATUS_FILTERS: { value: InvestigationStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "closed", label: "Closed" },
];

function NewInvestigationForm() {
  const [deviationNo, setDeviationNo] = useState("");
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(false);
  const [create, { isLoading, error, reset }] = useCreateInvestigationMutation();
  const navigate = useNavigate();
  const toast = useToast();

  const trimmed = deviationNo.trim();
  const validation = !trimmed ? "Enter the deviation number, e.g. DEV-2026-041." : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (validation) return;
    try {
      const inv = await create({ deviation_no: trimmed, title: title.trim() || undefined }).unwrap();
      toast("success", `Investigation ${inv.deviation_no} created`);
      navigate(`/investigations/${inv.id}`);
    } catch {
      /* shown inline */
    }
  }

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="new-inv-title">
      <div className="card__header">
        <FilePlus2 size={18} aria-hidden />
        <h2 id="new-inv-title" style={{ fontSize: "var(--text-base)" }}>Start a new investigation</h2>
      </div>
      <div className="card__body stack">
        <Field
          label="Deviation number"
          help="As recorded in your deviation log."
          error={(touched && validation) || (error ? errorMessage(error) : null)}
        >
          {(p) => (
            <input
              {...p}
              className="input mono"
              value={deviationNo}
              placeholder="DEV-2026-041"
              autoComplete="off"
              onChange={(e) => {
                setDeviationNo(e.target.value);
                if (error) reset();
              }}
              onBlur={() => setTouched(true)}
            />
          )}
        </Field>
        <Field label="Title" help="Optional — the AI fills this in from the incident documents.">
          {(p) => <input {...p} className="input" value={title} onChange={(e) => setTitle(e.target.value)} />}
        </Field>
        <Button variant="primary" type="submit" loading={isLoading} icon={<Plus size={16} aria-hidden />}>
          Create investigation
        </Button>
      </div>
    </form>
  );
}

export default function InvestigationListPage() {
  const { data = [], isLoading, error, refetch } = useListInvestigationsQuery();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvestigationStatus | "all">("all");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter(
      (inv) =>
        (status === "all" || inv.status === status) &&
        (!q || inv.deviation_no.toLowerCase().includes(q) || (inv.title ?? "").toLowerCase().includes(q)),
    );
  }, [data, query, status]);

  return (
    <>
      <div className="page-header">
        <div className="page-header__text">
          <h1>Investigations</h1>
          <p>Root cause analysis for manufacturing deviations. The AI drafts; you review and decide.</p>
        </div>
      </div>

      <div className="list-layout">
        <section className="card" aria-labelledby="list-title">
          <div className="card__header" style={{ flexWrap: "wrap" }}>
            <h2 id="list-title" style={{ fontSize: "var(--text-base)" }}>All investigations</h2>
            <span className="badge badge--neutral">{data.length}</span>
            <span className="spacer" />
            <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 280 }}>
              <Search size={16} aria-hidden style={{ position: "absolute", left: 12, top: 12, color: "var(--color-text-muted)" }} />
              <label htmlFor="inv-search" className="sr-only">Search investigations</label>
              <input
                id="inv-search"
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="Search number or title"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              className="select"
              style={{ width: "auto" }}
              value={status}
              onChange={(e) => setStatus(e.target.value as InvestigationStatus | "all")}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="card__body">
              <Alert tone="danger" title="Could not load investigations" action={<Button size="sm" onClick={refetch}>Retry</Button>}>
                {errorMessage(error)}
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="card__body stack" aria-busy="true" aria-label="Loading investigations">
              {[0, 1, 2].map((i) => <Skeleton key={i} height={36} />)}
            </div>
          ) : filtered.length === 0 ? (
            data.length === 0 ? (
              <EmptyState icon={<FolderSearch size={22} />} title="No investigations yet">
                Create one with the form, then add the incident documents.
              </EmptyState>
            ) : (
              <EmptyState icon={<Search size={22} />} title="No matches">
                Try a different search or status filter.
              </EmptyState>
            )
          ) : (
            <div className="table-wrap">
              <table className="table table--interactive">
                <thead>
                  <tr>
                    <th scope="col">Deviation</th>
                    <th scope="col">Title</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} onClick={() => navigate(`/investigations/${inv.id}`)}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <Link to={`/investigations/${inv.id}`} className="mono" style={{ fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>
                          {inv.deviation_no}
                        </Link>
                      </td>
                      <td>{inv.title ?? <span className="muted">Untitled — run the AI analysis</span>}</td>
                      <td><SeverityBadge severity={inv.severity} /></td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td className="muted" title={dateTime(inv.updated_at)} style={{ whiteSpace: "nowrap" }}>
                        {relativeTime(inv.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <NewInvestigationForm />
      </div>
    </>
  );
}
