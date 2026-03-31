// ── Badge ─────────────────────────────────────────────────────
export function Badge({ label, variant = "gray" }) {
  const map = {
    gray: "badge-gray",
    green: "badge-green",
    yellow: "badge-yellow",
    red: "badge-red",
    blue: "badge-blue",
  };
  return <span className={map[variant] ?? "badge-gray"}>{label}</span>;
}

// ── Status Badge ───────────────────────────────────────────────
export function StatusBadge({ status }) {
  const config = {
    PENDING: { label: "Pending", variant: "gray" },
    IN_PROGRESS: { label: "In Progress", variant: "blue" },
    DONE: { label: "Done", variant: "green" },
    OVERDUE: { label: "Overdue", variant: "red" },
    OPEN: { label: "Open", variant: "red" },
    IN_REVIEW: { label: "In Review", variant: "yellow" },
    RESOLVED: { label: "Resolved", variant: "green" },
  };
  const c = config[status] ?? { label: status, variant: "gray" };
  return <Badge label={c.label} variant={c.variant} />;
}

// ── Priority Badge ─────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = { LOW: "green", MEDIUM: "yellow", HIGH: "red" };
  return <Badge label={priority} variant={map[priority] ?? "gray"} />;
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const s = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  return (
    <div className={`${s} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <span className="text-5xl mb-3">{icon}</span>
      <p className="font-semibold text-gray-600">{title}</p>
      {message && <p className="text-sm mt-1">{message}</p>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
