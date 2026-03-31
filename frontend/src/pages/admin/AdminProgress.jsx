import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { StatusBadge, PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";

export default function AdminProgress() {
  const [selectedTeam, setSelectedTeam] = useState("");

  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: userService.getAllTeams });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: userService.getAllUsers });
  const { data: progress = [], isLoading } = useQuery({
    queryKey: ["progress", selectedTeam],
    queryFn: () => taskService.getProgress(selectedTeam),
    enabled: !!selectedTeam,
  });

  const stats = {
    PENDING: progress.filter((p) => p.status === "PENDING").length,
    IN_PROGRESS: progress.filter((p) => p.status === "IN_PROGRESS").length,
    DONE: progress.filter((p) => p.status === "DONE").length,
    OVERDUE: progress.filter((p) => p.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Progress Overview</h1>
        <select className="input w-48" value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}>
          <option value="">Select team…</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selectedTeam && progress.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([s, count]) => (
            <div key={s} className="card text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{s.replace("_", " ")}</p>
            </div>
          ))}
        </div>
      )}

      {!selectedTeam ? (
        <div className="card"><EmptyState icon="📊" title="Select a team" message="Choose a team to view progress." /></div>
      ) : isLoading ? (
        <PageLoader />
      ) : progress.length === 0 ? (
        <div className="card"><EmptyState icon="✅" title="No tasks" message="No tasks assigned to this team yet." /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Member</th>
                <th className="pb-2 pr-4">Task ID</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Assigned</th>
                <th className="pb-2">Completed</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => {
                const member = users.find((u) => u.id === p.memberId);
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium">{member?.name ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs font-mono">
                      {p.assignmentId?.slice(0, 8)}…
                    </td>
                    <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-2.5 pr-4 text-gray-500">
                      {p.assignedAt ? format(new Date(p.assignedAt), "dd MMM") : "—"}
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {p.completedAt ? format(new Date(p.completedAt), "dd MMM") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
