import { Microscope } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { DEMO_USERS, getCurrentUserId, setCurrentUserId } from "@/config/users";

export default function AppShell() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="app-header">
        <Link to="/" className="brand" aria-label="RCA Workbench home">
          <span className="brand__mark" aria-hidden>
            <Microscope size={18} />
          </span>
          <span className="brand__name">RCA Workbench</span>
          <span className="brand__sub">Deviation investigations</span>
        </Link>
        <span className="spacer" />
        <div className="user-switcher">
          <label htmlFor="user-switch">Signed in as</label>
          <select
            id="user-switch"
            className="select"
            defaultValue={getCurrentUserId()}
            onChange={(e) => {
              setCurrentUserId(e.target.value);
              window.location.reload();
            }}
          >
            {DEMO_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === "qa_approver" ? "QA approver" : "Investigator"})
              </option>
            ))}
          </select>
        </div>
        <ThemeToggle />
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
