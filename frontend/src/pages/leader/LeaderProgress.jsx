// LeaderProgress.jsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { StatusBadge, PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";

export function LeaderProgress() {
  const { user } = useAuth();
  const teamId = user?.teamId;

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ["progress", teamId],
    queryFn: () => taskService.getProgress(teamId),
    enabled: !!teamId,
  });
  const { data: members = [] } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => userService.getTeamMembers(teamId),
    enabled: !!teamId,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6">Team Progress</h1>
      {progress.length === 0 ? (
        <EmptyState icon="📊" title="No tasks yet" message="Delegate assignments to see progress." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Member</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Assigned</th>
                <th className="pb-2">Completed</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => {
                const m = members.find((u) => u.id === p.memberId);
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium">{m?.name ?? "—"}</td>
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
