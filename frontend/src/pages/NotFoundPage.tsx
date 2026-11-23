import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "@/components/ui/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="card">
      <EmptyState
        icon={<Compass size={22} />}
        title="Page not found"
        action={<Link to="/" className="btn btn--primary">Back to investigations</Link>}
      >
        The page you are looking for does not exist.
      </EmptyState>
    </div>
  );
}
