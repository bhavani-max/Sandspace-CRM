import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { taskService } from "../../services/taskService";
import { tokenService } from "../../services/tokenService";
import { userService } from "../../services/userService";
import { StatusBadge, PriorityBadge, PageLoader } from "../../components/common";

export default function LeaderDashboard() {
  const { user } = useAuth();
  const teamId = user?.teamId;

  const { data: members = [] } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => userService.getTeamMembers(teamId),
    enabled: !!teamId,
  });

  const { data: progress = [], isLoading: lp } = useQuery({
    queryKey: ["progress", teamId],
    queryFn: () => taskService.getProgress(teamId),
    enabled: !!teamId,
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ["tokens", teamId],
    queryFn: () => tokenService.getTeamTokens(teamId),
    enabled: !!teamId,
  });

  const openTokens = tokens.filter((t) => t.status === "OPEN");
  const done = progress.filter((p) => p.status === "DONE").length;
  const inProgress = progress.filter((p) => p.status === "IN_PROGRESS").length;

  if (lp) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1>Leader Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Team Members", value: members.length, icon: "👥" },
          { label: "Tasks In Progress", value: inProgress, icon: "⚙️" },
          { label: "Tasks Done", value: done, icon: "✅" },
          { label: "Open Tokens", value: openTokens.length, icon: "🎫" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card text-center">
            <span className="text-3xl">{icon}</span>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Member task cards */}
      <div>
        <h2 className="mb-3">Team Task Status</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-400">No members in your team yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => {
              const tasks = progress.filter((p) => p.memberId === m.id);
              return (
                <div key={m.id} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {m.name[0]}
                    </div>
                    <span className="font-medium text-sm">{m.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{tasks.length} task(s)</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tasks.map((t) => <StatusBadge key={t.id} status={t.status} />)}
                    {tasks.length === 0 && <span className="text-xs text-gray-300">No tasks assigned</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Open tokens */}
      {openTokens.length > 0 && (
        <div>
          <h2 className="mb-3">Open Support Tokens</h2>
          <div className="space-y-2">
            {openTokens.slice(0, 5).map((t) => (
              <div key={t.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.description.slice(0, 60)}…</p>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
