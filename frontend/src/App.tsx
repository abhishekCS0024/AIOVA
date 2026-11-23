import { Route, Routes } from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import InvestigationListPage from "@/pages/InvestigationListPage";
import InvestigationWorkspacePage from "@/pages/InvestigationWorkspacePage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<InvestigationListPage />} />
        <Route path="investigations/:id" element={<InvestigationWorkspacePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
