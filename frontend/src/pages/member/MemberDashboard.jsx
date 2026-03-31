import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { taskService } from "../../services/taskService";
import { tokenService } from "../../services/tokenService";
import { reportService } from "../../services/reportService";
import { workspaceService } from "../../services/workspaceService";
import { StatusBadge, PriorityBadge, PageLoader } from "../../components/common";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function MemberDashboard() {
  const { user } = useAuth();

  const { data: tasks = [], isLoading: lt } = useQuery({
    queryKey: ["myTasks"],
    queryFn: taskService.getMyTasks,
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ["myTokens"],
    queryFn: tokenService.myTokens,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["myReports"],
    queryFn: reportService.myReports,
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ["myWorkspaces"],
    queryFn: workspaceService.myWorkspaces,
  });

  if (lt) return <PageLoader />;

  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const openTokens = tokens.filter((t) => t.status === "OPEN").length;

  const submittedToday = reports.some(
    (r) => r.reportDate === format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
      </div>

      {/* EOD reminder */}
      {!submittedToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800 text-sm">📝 EOD Report Pending</p>
            <p className="text-amber-600 text-xs mt-0.5">Don't forget to submit your end-of-day report.</p>
          </div>
          <Link to="/member/eod" className="btn-primary text-sm">Submit Now</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Tasks", value: pending, icon: "⏳", color: "bg-gray-50" },
          { label: "In Progress", value: inProgress, icon: "⚙️", color: "bg-blue-50" },
          { label: "Completed", value: done, icon: "✅", color: "bg-green-50" },
          { label: "Open Tokens", value: openTokens, icon: "🎫", color: "bg-red-50" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`card text-center ${color}`}>
            <span className="text-3xl">{icon}</span>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Active tasks preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2>Active Tasks</h2>
          <Link to="/member/tasks" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        {tasks.length === 0 ? (
          <div className="card text-center py-8 text-gray-400 text-sm">No tasks assigned yet.</div>
        ) : (
          <div className="space-y-2">
            {tasks.filter((t) => t.status !== "DONE").slice(0, 4).map((t) => (
              <div key={t.id} className="card flex items-center justify-between py-3">
                <span className="text-sm font-medium truncate">{t.assignmentId}</span>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspaces preview */}
      {workspaces.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2>My Workspaces</h2>
            <Link to="/member/workspaces" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {workspaces.slice(0, 4).map((w) => (
              <Link key={w.id} to={`/member/workspaces/${w.id}`}
                className="card hover:shadow-md transition-shadow">
                <p className="font-medium text-sm">🤝 {w.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {format(new Date(w.createdAt), "dd MMM yyyy")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
